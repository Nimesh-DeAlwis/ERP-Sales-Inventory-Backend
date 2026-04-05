const { body, query, param, validationResult } = require('express-validator');

const validateCreateTitle = [
    body('titleCode')
        .notEmpty().withMessage('Title code is required')
        .isLength({ min: 1, max: 50 }).withMessage('Title code must be 1-10 characters')
        .matches(/^[A-Z0-9]+$/).withMessage('Title code can only contain uppercase letters and numbers'),
    
    body('description')
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 100 }).withMessage('Description must be max 100 characters'),
    
    body('status')
        .optional()
        .isBoolean().withMessage('Status must be boolean'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateUpdateTitle = [
    param('id')
        .notEmpty().withMessage('Title code is required')
        .isLength({ max: 10 }).withMessage('Title code must be max 10 characters'),
    
    ...validateCreateTitle.slice(0, -1),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateSearchTitles = [
    query('searchText')
        .optional()
        .isLength({ max: 100 }).withMessage('Search text too long'),
    
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
    query('pageSize')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Page size must be between 1 and 100'),
    
    query('status')
        .optional()
        .isIn(['0', '1', 'true', 'false']).withMessage('Invalid status value'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateCheckDuplicate = [
    query('titleCode')
        .notEmpty().withMessage('Title code is required')
        .isLength({ max: 10 }).withMessage('Title code must be max 10 characters'),
    
    query('excludeTitleCode')
        .optional()
        .isLength({ max: 10 }).withMessage('Exclude title code must be max 10 characters'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateCreateTitle,
    validateUpdateTitle,
    validateSearchTitles,
    validateCheckDuplicate
};