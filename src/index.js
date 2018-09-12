// Dependencies
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');
const gridFsStorage = require('multer-gridfs-storage');
const bodyParser = require('body-parser');
const { check, validationResult, body } = require('express-validator/check');
let bcrypt = require('bcrypt');

/*
 * Start Initialization
 */
 
 // Express
const app = express();
app.use('/public', express.static('public'))
app.use('/public/dist', express.static('bower_components'));
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// MongoDB
const storage = new gridFsStorage({
    db: mongoose.connect('mongodb://localhost:27017/fldrppr'),
    file: () => { return  { bucketName: 'uploaded' } }
});
let upload = multer({ storage: storage });
mongoose.connection.on('error', function(err){
    console.log('conneciton error', err);
});
mongoose.connection.once('open', function(err){
    console.log('Connection to DB successful');
});
/*
 * Begin Schema (copy and pasted from docs btw)
 * s/o to http://devsmash.com/blog/implementing-max-login-attempts-with-mongoose
 * Original author for about 80% of this code - jmar777
 */
let newUserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    loginAttempts: { type: Number, required: true, default: 0 },
    lockUntil: { type: Number }
});
newUserSchema.statics.failedLogin = {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2
};
newUserSchema.virtual('isLocked').get(function() {
    // check for a future lockUntil timestamp
    return !!(this.lockUntil && this.lockUntil > Date.now());
});
newUserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};
newUserSchema.methods.incLoginAttempts = function(cb) {
    // if we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.update({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        }, cb);
    }
    // otherwise we're incrementing
    var updates = { $inc: { loginAttempts: 1 } };
    // lock the account if we've reached max attempts and it's not locked already
    if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + LOCK_TIME };
    }
    return this.update(updates, cb);
};
let User = mongoose.model('User', newUserSchema);
const SALT_WORK_FACTOR = 10;
// this is where the hash in the password is set up
newUserSchema.pre('save', function(next){
    var user = this;
    if (!user.isModified('password')) return next();
 
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
        if(err) return next(err);
 
        bcrypt.hash(user.password, salt, function(err, hash){
            if(err) return next(err);
 
            user.password = hash;
            next();
        });
    });
});
// takes username and password, returns a cb if its authenticatetd or not
newUserSchema.statics.getAuthenticated = function(username, password, cb) {
    this.findOne({ username: username }, function(err, user) {
        if (err) return cb(err);

        // make sure the user exists
        if (!user) {
            return cb(null, null, reasons.NOT_FOUND);
        }

        // check if the account is currently locked
        if (user.isLocked) {
            // just increment login attempts if account is already locked
            return user.incLoginAttempts(function(err) {
                if (err) return cb(err);
                return cb(null, null, reasons.MAX_ATTEMPTS);
            });
        }

        // test for a matching password
        user.comparePassword(password, function(err, isMatch) {
            if (err) return cb(err);

            // check if the password was a match
            if (isMatch) {
                // if there's no lock or failed attempts, just return the user
                if (!user.loginAttempts && !user.lockUntil) return cb(null, user);
                // reset attempts and lock info
                var updates = {
                    $set: { loginAttempts: 0 },
                    $unset: { lockUntil: 1 }
                };
                return user.update(updates, function(err) {
                    if (err) return cb(err);
                    return cb(null, user);
                });
            }

            // password is incorrect, so increment login attempts before responding
            user.incLoginAttempts(function(err) {
                if (err) return cb(err);
                return cb(null, null, reasons.PASSWORD_INCORRECT);
            });
        });
    });
};
/*
 *  End Schema
 */

// DotEnv
dotenv.config();

// Global variables
const PORT = process.env.PORT || 8080;
const config = require(path.join(__dirname, '..', 'config.json'));

// Port listen
app.listen(PORT, () => {
    console.log('Listening on port ' + PORT + ' :D')
});

/*
 * End Initialization
 */


// Routes - get
app.get('/', (req, res) => {
    return res.render('home');
});

app.get('/upload', (req, res) => {
    return res.render('upload', {
        dropzoneConfig: config.dropzone
    });
});

app.get('/login', (req, res) => {
    return res.render('login');
});

app.get('/signup', (req, res) => {
    return res.render('signup');
});

app.post('/signup', [
    // Validation
    check('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters!'),
    check('email').isEmail().withMessage('Email must be a valid email'),
    check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters!'),
    check('password-confirm').custom((value, {req, loc, path}) => {
        if(value !== req.body.password) throw new Error("Passwords do not match");
        return value;
    })
], (req, res) => {
    const errors = validationResult(req);
    console.log(errors.array());
    res.status(200).send(errors.array());
    // Using highly superior mongoose
    let newUser = new User({
        username:req.body.username,
        email:req.body.email,
        password:req.body.password,
    });
    newUser.save(function(err,data){
        if(err) console.log(err);
        else console.log('Success:', data);
    });
});

app.post('/login', (req, res) =>{
    // login code here
    // s/o to jmar777 @ http://devsmash.com/blog/implementing-max-login-attempts-with-mongoose
    // attempt to authenticate user
    User.getAuthenticated(body.Username, body.Password, function(err, user, reason) {
        if (err) throw err;

        // login was successful if we have a user
        if (user) {
            // handle login success
            console.log('login success');
            return;
        }

        // otherwise we can determine why we failed
        var reasons = User.failedLogin;
        switch (reason) {
            case reasons.NOT_FOUND:
            case reasons.PASSWORD_INCORRECT:
                // note: these cases are usually treated the same - don't tell
                // the user *why* the login failed, only that it did
                break;
            case reasons.MAX_ATTEMPTS:
                // send email or otherwise notify user that account is
                // temporarily locked
                break;
        }
    });
});

// Upload page back-end
app.post('/file-upload', upload.single('file'), (req, res) => {
    console.log(req.file);

    // Insert code to add fileID to user array

    return res.status(200).send('Success');
});