// Dependencies
const express = require('express');
const dotenv = require('dotenv');
const ejs = require('ejs');
const path = require('path');
const multer = require('multer');
const mongojs = require('mongojs');

// Initialization
const app = express();

let db = mongojs('fldrppr', ['users']);

dotenv.config();

app.use('/public', express.static('public'))
app.use('/public/dist', express.static('bower_components'));
app.set('view engine', 'ejs');
app.set('views', 'views');

// Global variables
const PORT = process.env.PORT || 8080;
const config = require(path.join(__dirname, '..', 'config.json'));

let memStorage = multer.memoryStorage();
let upload = multer({
    storage: memStorage
});

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

app.post('/file-upload', upload.single('file'), (req, res) => {
    console.log(req.file);
    return res.status(200).send('Success');
});

// Database Checking Debug
app.get('/monGOD', (req, res) => {
    db.users.find(function (err, docs) {
        if (err) throw err;
        console.log(docs);
        res.send(docs[0].email);
    })
})