// Dependencies
const express = require('express');
const dotenv = require('dotenv');
const ejs = require('ejs');
const path = require('path');
const multer = require('multer');
const mongojs = require('mongojs');
<<<<<<< HEAD
const mongoose = require('mongoose');
const gridFsStorage = require('multer-gridfs-storage');
=======
const expressValidator = require('express-validator');
>>>>>>> e67501baa6a275bca8e62f5d0db793a5021e41fb

/*
 * Initialization
 */
 // Express
const app = express();
app.use('/public', express.static('public'))
app.use('/public/dist', express.static('bower_components'));
app.set('view engine', 'ejs');
app.set('views', 'views');

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

// Routes
app.get('/', (req, res) => {
    return res.render('home');
});

app.get('/upload', (req, res) => {
    return res.render('upload', {
        dropzoneConfig: config.dropzone
    });
});

// Sign up Page back-end
app.post('/signup', (req, res) => {

    let newUser = {
        userName: req.body.userName,
        passwd: req.body.passwd,
        email: req.body.email
    }
});

app.get('/users-list', (req, res) => {
    db.users.find( (err, docs) =>{
        res.send(JSON.stringify(docs));
    });
});
/*
// Upload page back-end
app.post('/file-upload', upload.single('file'), (req, res) => {
    console.log(req.file);
    return res.status(200).send('Success');
});
*/