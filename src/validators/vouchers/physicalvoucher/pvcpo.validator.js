const { body, query, validationResult } = require('express-validator');

const validateCreatePVCPO = [
    body('header.type')
        .notEmpty().withMessage('Transaction type is required')
        .isLength({ max: 3 }).withMessage('Type must be max 3 characters'),
    
    body('header.runNo')
        .notEmpty().withMessage('Document number is required'),
    
    body('header.txnDate')
        .notEmpty().withMessage('Date is required'),
    
    body('details')
        .isArray({ min: 1 }).withMessage('At least one item is required'),
    
    body('details.*.vcbStart')
        .isNumeric().withMessage('Start number must be numeric')
        .custom(value => value >= 0).withMessage('Start number cannot be negative'),
    
    body('details.*.vcbQty')
        .isNumeric().withMessage('Quantity must be numeric')
        .custom(value => value > 0).withMessage('Quantity must be greater than 0'),
    
    body('details.*.vcbEnd')
        .isNumeric().withMessage('End number must be numeric'),
    
    body('details.*.sPrice')
        .isNumeric().withMessage('Selling price must be numeric')
        .custom(value => value >= 0).withMessage('Selling price cannot be negative'),
    
    body('details.*.cPrice')
        .isNumeric().withMessage('Cost price must be numeric')
        .custom(value => value >= 0).withMessage('Cost price cannot be negative'),
    
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

const validateSearchPVCPO = [
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
    validateCreatePVCPO,
    validateSearchPVCPO
};