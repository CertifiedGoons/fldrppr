const router = require('express').Router();
const { check, validationResult } = require('express-validator/check');

router.get('/', (req, res) => res.render('signup'));

router.post('/new_account', [
    check('username')
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters long.'),
    check('email')
        .isEmail()
        .withMessage('Email must be a valid email address.'),
    check('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long.'),
    check('password-confirm').custom((value, { req, loc, path }) => {
        if(value !== req.body.password) throw new Error('Passwords do not match.');
        return value;
    })
], (req, res) => {
    const errors = validationResult(req);
    console.log(errors.array());
    res.status(200).status(errors.array());
});

module.exports = router;