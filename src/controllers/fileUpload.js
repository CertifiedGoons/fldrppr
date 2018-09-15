import { fileUploadStorage } from '../index';
import httpStatus from 'http-status-codes';

exports.file_upload_get = (req, res) => res.render('upload');

exports.file_upload_multer_middleware = fileUploadStorage.single('file');

exports.file_upload_post = (req, res) => {
    console.log(req.file);
    res.status(httpStatus.OK).send();
}