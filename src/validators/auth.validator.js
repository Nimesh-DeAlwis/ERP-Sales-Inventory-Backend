const { body, validationResult } = require('express-validator');

const validateLogin = [
    body('username')
        .notEmpty().withMessage('Username is required')
        .isLength({ max: 10 }).withMessage('Username must be max 10 characters'),
    
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 3 }).withMessage('Password must be at least 3 characters'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateLocation = [
    body('userId')
        .notEmpty().withMessage('User ID is required'),
    
    body('locationCode')
        .notEmpty().withMessage('Location code is required')
        .isLength({ max: 5 }).withMessage('Location code must be max 5 characters'),
    
    body('userGroup')
        .optional()
        .isLength({ max: 5 }).withMessage('User group must be max 5 characters'),
    
    body('userName')
        .optional()
        .isLength({ max: 100 }).withMessage('User name must be max 100 characters'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateLogin,
    validateLocation
};