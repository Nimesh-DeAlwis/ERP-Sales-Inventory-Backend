const { body, query, param, validationResult } = require('express-validator');

const validateCreateSupplier = [
    body('supplierCode')
        .notEmpty().withMessage('Supplier code is required')
        .isLength({ max: 10 }).withMessage('Supplier code must be max 10 characters'),
    
    body('name')
        .notEmpty().withMessage('Supplier name is required'),
    
    body('groupCode')
        .notEmpty().withMessage('Supplier group is required'),
    
    body('status')
        .optional()
        .isBoolean().withMessage('Status must be boolean'),
    
    body('address1')
        .notEmpty().withMessage('Address is required'),
    
    body('mobile1')
        .notEmpty().withMessage('Mobile number is required')
        .matches(/^\d{10}$/).withMessage('Mobile number must be 10 digits'),
    
    body('mobile2')
        .optional({ nullable: true, checkFalsy: true })
        .matches(/^\d{10}$/).withMessage('Mobile number must be 10 digits'),

    body('email')
        .optional({ nullable: true, checkFalsy: true })
        .isEmail().withMessage('Invalid email format'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateUpdateSupplier = [
    param('id')
        .notEmpty().withMessage('Supplier code is required'),
    
    ...validateCreateSupplier.slice(0, -1),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateSearchSuppliers = [
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
    query('supplierCode')
        .notEmpty().withMessage('Supplier code is required'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateCreateSupplier,
    validateUpdateSupplier,
    validateSearchSuppliers,
    validateCheckDuplicate
};