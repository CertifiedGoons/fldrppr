import httpStatus from 'http-status-codes';
import { fileUploadStorage, logger } from '../index'; // eslint-disable-line

// Display upload page
exports.file_upload_get = (req, res) => res.render('upload');

// Pass file to multer to be stored in db
exports.file_upload_multer = fileUploadStorage.single('file');

// Response to file upload
exports.file_upload_post = (req, res) => {
    logger.info(req.file);
    res.status(httpStatus.OK).send();
};
