const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const router = express.Router();

app.listen(process.env.PORT || 8080, () => {
    console.log(`Express listening on port ${process.env.PORT || 8080}.`);
});

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static('public'));
app.use('/public/dist', express.static('bower_components'));
app.use('/', require('./routes/home'));
app.use('/upload', require('./routes/upload'));
app.use('/signup', require('./routes/signup'));
app.use('/login', require('./routes/login'));