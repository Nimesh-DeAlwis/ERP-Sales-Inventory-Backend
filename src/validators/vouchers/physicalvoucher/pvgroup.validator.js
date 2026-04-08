const { body, query, validationResult } = require('express-validator');

const validateCreatePVGroup = [
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
    
    body('cost')
        .optional()
        .isNumeric().withMessage('Cost must be a number')
        .custom(value => value >= 0).withMessage('Cost cannot be negative'),
    
    body('bookQty')
        .optional()
        .isNumeric().withMessage('Book quantity must be a number')
        .custom(value => value >= 0).withMessage('Book quantity cannot be negative'),
    
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

const validateUpdatePVGroup = [
    body('description')
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 100 }).withMessage('Description must be max 100 characters'),
    
    body('value')
        .isNumeric().withMessage('Value must be a number')
        .custom(value => value >= 0).withMessage('Value cannot be negative'),
    
    body('expDays')
        .isNumeric().withMessage('Expiry days must be a number')
        .custom(value => value >= 0).withMessage('Expiry days cannot be negative'),
    
    body('cost')
        .optional()
        .isNumeric().withMessage('Cost must be a number')
        .custom(value => value >= 0).withMessage('Cost cannot be negative'),
    
    body('bookQty')
        .optional()
        .isNumeric().withMessage('Book quantity must be a number')
        .custom(value => value >= 0).withMessage('Book quantity cannot be negative'),
    
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

const validateSearchPVGroup = [
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
    validateCreatePVGroup,
    validateUpdatePVGroup,
    validateSearchPVGroup
};