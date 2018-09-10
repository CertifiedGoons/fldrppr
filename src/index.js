// Dependencies
const express = require('express');
const dotenv = require('dotenv');
const ejs = require('ejs');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');
const gridFsStorage = require('multer-gridfs-storage');
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const { check, validationResult, body } = require('express-validator/check');
let bcrypt = require('bcrypt');
/*
 * Start Initialization
 */
 
 // Express
const app = express();
//const check = expressValidator.check;
//const validationResult = expressValidator.validationResult;
app.use('/public', express.static('public'))
app.use('/public/dist', express.static('bower_components'));
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// MongoDB
const mongoConnection = mongoose.connect('mongodb://localhost:27017/fldrppr');
const storage = new gridFsStorage({
    db: mongoConnection,
    file: () => { return  { bucketName: 'uploaded' } }
});
let upload = multer({ storage: storage });
mongoose.connect('mongodb://localhost:27017/fldrppr');
let db = mongoose.connection;
db.on('error', function(err){
    console.log('conneciton error', err);
});
db.once('open', function(err){
    console.log('Connection to DB successful');
});

// Schema
let Schema = mongoose.Schema;
let newUserSchema = new Schema({
    username:String,
    email:String,
    password:String
});
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

app.get('/signup', (req, res) => {
    return res.render('signup');
});

// Sign up Page back-end
app.post('/signup', [
    // Validation
    check('username')
        .isLength({ min: 1 })
       .withMessage('Name is required.'),
    check('email')
		.isLength({ min: 1 })
		.withMessage('Email is required.')
		.isEmail().withMessage('Please provide a valid email address'),
    check('password')
		.isLength({ min: 1 })
		.withMessage('Password is required.'),
    check('password-confirm')
        .isLength({ min: 1 })
        .withMessage('Confirm password is required.')
        .equals('password')
        .withMessage('Passwords must match.')
  ],
    // checking password confirm is same as password
    /*
    body('password-confirm').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    })
    */
    (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
     }
    else {
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
    }
    res.status(200).send();
});

// Upload page back-end
app.post('/file-upload', upload.single('file'), (req, res) => {
    console.log(req.file);

    // Insert code to add fileID to user array

    return res.status(200).send('Success');
});