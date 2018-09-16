/**
 * TODO: Add winston middleware
 * TODO: Add ES-Lint
 * TODO: Implement express sessions
 * TODO: Sass support
 * ? Should we use JWT for auth handling?
 */

import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose, { connection } from 'mongoose';
import multer from 'multer';
import gridFsStorage from 'multer-gridfs-storage';

const app = express();

app.listen(process.env.PORT || 8080, () => {
    console.log(`Express listening on port ${process.env.PORT || 8080}.`);
});

// database connection
const db = mongoose.connect(process.env.MONGO || 'mongodb://localhost:27017/fldrppr', { useNewUrlParser: true });
const storage = new gridFsStorage({
    db: db,
    file: () => { return { bucketName: 'uploaded' } }
});
mongoose.connection.on('error', (err) => console.log('MongoDB connection error: ', err));
mongoose.connection.once('open', () => console.log('MongoDB connection successful'));
exports.fileUploadStorage = multer({ storage: storage });

// defining middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(path.join(__dirname, '..', 'public')));
app.use('/public/dist', express.static('bower_components'));

// Load routes via router file
require('./router')(app);