import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import expressWinston from 'express-winston';
import winston from 'winston';
import mongoose from 'mongoose';
import multer from 'multer';
import GridFSStorage from 'multer-gridfs-storage';

// Winston init
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined_output.log' }),
    ],
});
exports.logger = logger;
// Add stdout as transport if not in production
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({ format: winston.format.simple() }));
}
// Express middleware options
const expressWinstonSettings = {
    transports: [
        new winston.transports.File({
            filename: path.join('logs/requests.log'),
        }),
    ],
};

const app = express();

app.listen(process.env.PORT || 8080, () => {
    logger.info(`Express listening on port ${process.env.PORT || 8080}.`);
});

// database connection
const db = mongoose.connect(process.env.MONGO || 'mongodb://localhost:27017/fldrppr', { useNewUrlParser: true });
const storage = new GridFSStorage({
    db,
    file() {
        return { bucketName: 'uploaded' };
    },
});
mongoose.connection.on('error', err => logger.error(`MongoDB connection error: ${err}`));
mongoose.connection.once('open', () => logger.info('MongoDB connection successful'));
exports.fileUploadStorage = multer({ storage });

// defining middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressWinston.logger(expressWinstonSettings));
app.use('/public', express.static(path.join(__dirname, '..', 'public')));
app.use('/public/dist', express.static('bower_components'));

// Load routes via router file
require('./router')(app);
