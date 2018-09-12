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

// Schema
let newUserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
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

app.get('/login', (req, res) => {
    return res.render('login');
});

app.get('/signup', (req, res) => {
    return res.render('signup');
});

app.post('/signup', [
    check('username').isLength({ min: 3 }),
    check('email').isEmail(),
    check('password').isLength({ min: 8 }),
    check('password-confirm').custom((value, {req, loc, path}) => {
        if(value !== req.body.password) throw new Error("Passwords do not match");
        return value;
    })
], (req, res) => {
    const errors = validationResult(req);
    console.log(errors.array());
    res.status(200).send(errors.array());
});

// Upload page back-end
app.post('/file-upload', upload.single('file'), (req, res) => {
    console.log(req.file);

    // Insert code to add fileID to user array

    return res.status(200).send('Success');
});