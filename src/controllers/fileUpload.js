import { fileUploadStorage } from '../index';
import httpStatus from 'http-status-codes';

// Display upload page
exports.file_upload_get = (req, res) => res.render('upload');

// Pass file to multer to be stored in db
exports.file_upload_multer = fileUploadStorage.single('file');

// Response to file upload
exports.file_upload_post = (req, res) => {
    console.log(req.file);
    res.status(httpStatus.OK).send();
}