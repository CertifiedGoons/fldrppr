// Dependencies
const express = require('express');
const dotenv = require('dotenv');
const ejs = require('ejs');
const path = require('path');
const multer = require('multer');
const mongojs = require('mongojs');
const mongoose = require('mongoose');
const gridFsStorage = require('multer-gridfs-storage');
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');

/*
 * Start Initialization
 */
 
 // Express
const app = express();
const check = expressValidator.check;
const validationResult = expressValidator.validationResult;
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
app.post('/signup', (req, res) => {
    req.checkBody('username', 'Username is Required').notEmpty();
    req.checkBody('email', 'Email is Required').notEmpty();
    req.checkBody('password', 'Password is Required').notEmpty();

    let errors = req.validationErrors();

    if(errors){

    } else {
        let newUser = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        }
    }

    
    res.status(200).send();
});
// Upload page back-end
app.post('/file-upload', upload.single('file'), (req, res) => {
    console.log(req.file);

    // Insert code to add fileID to user array

    return res.status(200).send('Success');
});