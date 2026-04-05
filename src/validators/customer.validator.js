const { body, query, param, validationResult } = require('express-validator');

const validateCreateCustomer = [
    body('customerCode')
        .notEmpty().withMessage('Customer code is required')
        .isLength({ max: 30 }).withMessage('Customer code must be max 30 characters'),
    
    body('titleCode')
        .notEmpty().withMessage('Title is required'),
    
    body('firstName')
        .notEmpty().withMessage('First name is required')
        .isLength({ max: 150 }).withMessage('First name must be max 150 characters'),
    
    body('fullName')
        .notEmpty().withMessage('Full name is required')
        .isLength({ max: 150 }).withMessage('Full name must be max 150 characters'),
    
    body('groupCode')
        .notEmpty().withMessage('Customer group is required'),
    
    body('status')
        .optional()
        .isBoolean().withMessage('Status must be boolean'),
    
    body('email')
        .optional({ nullable: true, checkFalsy: true })
        .isEmail().withMessage('Invalid email format')
        .isLength({ max: 100 }).withMessage('Email must be max 100 characters'),
    
    body('gender')
        .optional()
        .isIn(['M', 'F', '']).withMessage('Gender must be M or F'),
    
    body('dob')
         .optional({ nullable: true, checkFalsy: true })
        .isDate().withMessage('Invalid date format'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateUpdateCustomer = [
    param('id')
        .notEmpty().withMessage('Customer code is required'),
    
    ...validateCreateCustomer.slice(0, -1),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateSearchCustomers = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
    query('pageSize')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Page size must be between 1 and 100'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateCheckDuplicate = [
    query('customerCode')
        .notEmpty().withMessage('Customer code is required'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateCreateCustomer,
    validateUpdateCustomer,
    validateSearchCustomers,
    validateCheckDuplicate
};