// Dependencies
const express = require('express');
const dotenv = require('dotenv');
const ejs = require('ejs');
var mongojs = require('mongojs');

// Initialization
const app = express();
let db = mongojs('fldrppr', ['users']);

dotenv.config();

app.use('/public', express.static('public'))
app.set('view engine', 'ejs');
app.set('views', 'views');

// Global consts
const PORT = process.env.PORT || 8080;

// Port listen
app.listen(PORT, () => {
        console.log('Listening on port ' + PORT + ' :D')
});

// Routes
app.get('/', (req, res) => {
        res.render('home');
});

app.get('/upload', (req, res) => {
        res.render('upload');
});

// Database Checking Debug
app.get('/monGOD', (req, res) => {
        db.users.find(function (err, docs) {
                if(err) throw err;
                console.log(docs);
                res.send(docs[0].email);
        })
})