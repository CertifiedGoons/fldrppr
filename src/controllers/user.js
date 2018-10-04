import httpStatus from 'http-status-codes';
import { check, validationResult } from 'express-validator/check';
import User from '../models/users';

// Display login page
exports.user_login_get = (req, res) => res.render('login');

// Handle login request
exports.user_login_post = (req, res) => {
    User.authenticate(req.body.user, req.body.password, (err, user, reason) => {
        if (err) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send();
        } else {
            if (user) {
                res.status(httpStatus.OK).send('Login successful');
                return;
            }
            const reasons = User.failedLogin;
            switch (reason) {
            case reasons.NOT_FOUND:
            case reasons.PASSWORD_INCORRECT:
                res.status(httpStatus.OK).send('Login failed. Username/email or password incorrect');
                break;
            case reasons.MAX_ATTEMPTS:
                res.status(httpStatus.OK).send('Account as been locked due to too many login attempts');
                break;
            default:
                res.status(httpStatus.INTERNAL_SERVER_ERROR).send();
                break;
            }
        }
    });
};

// Display signup page
exports.user_signup_get = (req, res) => res.render('signup');

// Validation scheme used when creating account
exports.user_signup_validation = [
    check('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters!'),
    check('email').isEmail().withMessage('Email must be a valid email'),
    check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters!'),
    check('password-confirm').custom((value, { req }) => {
        if (value !== req.body.password) throw new Error('Passwords do not match');
        return value;
    }),
];

// Handle signup request
exports.user_signup_post = (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        res.status(httpStatus.UNPROCESSABLE_ENTITY).send(validationErrors.array());
    } else {
        (new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
        })).save((err) => {
            if (err) {
                console.log('Error saving new user to database: ', err);
                res.status(httpStatus.INTERNAL_SERVER_ERROR).send();
            } else {
                res.status(httpStatus.OK).send();
            }
        });
    }
};
