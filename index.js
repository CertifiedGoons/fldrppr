// Dependencies
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');

// Express Setup
const app = express();
app.use('/public', express.static('public'));
app.use('/public/dist/dropzone', express.static('node_modules/dropzone'))
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.listen(process.env.PORT || 8080, () => {
    console.log(`Express listening on port ${process.env.PORT || 8080}`);
});

// Express routes
let router = express.Router();
router.use('/test', require('./router/home.js'));
router.get('/', (req, res) => { res.send('hello') })
// router.use('/upload', require('./router/upload'));
// router.use('/signup', require('./router/signup'));
// router.use('/login', require('./router/login'));