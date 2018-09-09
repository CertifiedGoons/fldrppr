// Dependencies
const express = require('express');
const dotenv = require('dotenv');
const ejs = require('ejs');

const app = express();

// Initialization
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