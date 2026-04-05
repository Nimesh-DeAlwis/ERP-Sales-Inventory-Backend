const { body, query, validationResult } = require('express-validator');

const validateCreateVER = [
    body('header.type')
        .notEmpty().withMessage('Transaction type is required')
        .isLength({ max: 3 }).withMessage('Type must be max 3 characters'),
    
    body('header.comCode')
        .notEmpty().withMessage('Company code is required')
        .isLength({ max: 5 }).withMessage('Company code must be max 5 characters'),
    
    body('header.logLocation')
        .notEmpty().withMessage('Log location is required'),
    
    body('header.locFrom')
        .notEmpty().withMessage('Location is required'),
    
    body('details')
        .isArray({ min: 1 }).withMessage('At least one item is required'),
    
    body('details.*.proCode')
        .notEmpty().withMessage('Product code is required'),
    
    body('details.*.additionsQty')
        .optional()
        .isInt({ min: 0 }).withMessage('Addition quantity must be a positive number'),
    
    body('details.*.deductionsQty')
        .optional()
        .isInt({ min: 0 }).withMessage('Deduction quantity must be a positive number'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }
        next();
    }
];

const validateSearchVER = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
    query('pageSize')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Page size must be between 1 and 100'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }
        next();
    }
];

module.exports = {
    validateCreateVER,
    validateSearchVER
};