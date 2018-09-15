import homeController from './controllers/home';
import userController from './controllers/user';
import fileUploadController from './controllers/fileUpload';

module.exports = app => {

    // Home Controller
    app.get('/', homeController.Home);

    // User Controller
    app.get('/login', userController.user_login_get);
    app.get('/signup', userController.user_signup_get);

    app.post('/login', userController.user_login_post);
    app.post('/signup', userController.user_signup_validation, userController.user_signup_post);

    // File Upload Controller
    app.get('/upload', fileUploadController.file_upload_get);
    app.post('/upload', fileUploadController.file_upload_multer_middleware, fileUploadController.file_upload_post);

}