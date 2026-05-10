const { body, query, validationResult } = require('express-validator');

const validateCreateEVGroup = [
    body('code')
        .notEmpty().withMessage('Group code is required')
        .isLength({ max: 3 }).withMessage('Code must be max 3 characters')
        .matches(/^[A-Z0-9]+$/).withMessage('Code must contain only uppercase letters and numbers'),
    
    body('description')
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 100 }).withMessage('Description must be max 100 characters'),
    
    body('value')
        .isNumeric().withMessage('Value must be a number')
        .custom(value => value >= 0).withMessage('Value cannot be negative'),
    
    body('expDays')
        .isNumeric().withMessage('Expiry days must be a number')
        .custom(value => value >= 0).withMessage('Expiry days cannot be negative'),
    
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

const validateUpdateEVGroup = [
    body('description')
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 100 }).withMessage('Description must be max 100 characters'),
    
    body('value')
        .isNumeric().withMessage('Value must be a number')
        .custom(value => value >= 0).withMessage('Value cannot be negative'),
    
    body('expDays')
        .isNumeric().withMessage('Expiry days must be a number')
        .custom(value => value >= 0).withMessage('Expiry days cannot be negative'),
    
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

const validateSearchEVGroup = [
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
    validateCreateEVGroup,
    validateUpdateEVGroup,
    validateSearchEVGroup
};