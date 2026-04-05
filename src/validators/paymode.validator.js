const { body, query, param, validationResult } = require('express-validator');

const validateCreatePayMode = [
    body('headerData.phCode')
        .notEmpty().withMessage('Payment mode code is required')
        .isLength({ min: 1, max: 8 }).withMessage('Payment mode code must be 1-8 characters')
        .matches(/^[A-Z0-9]+$/).withMessage('Payment mode code can only contain uppercase letters and numbers'),
    
    body('headerData.description')
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 30 }).withMessage('Description must be max 30 characters'),
    
    body('headerData.status')
        .optional()
        .isInt({ min: 0, max: 1 }).withMessage('Status must be 0 or 1'),
    
    body('headerData.hasDetails')
        .optional()
        .isInt({ min: 0, max: 1 }).withMessage('Has details must be 0 or 1'),
    
    body('details')
        .optional()
        .isArray().withMessage('Details must be an array'),
    
    body('details.*.detailCode')
        .optional()
        .isLength({ max: 8 }).withMessage('Detail code must be max 8 characters'),
    
    body('details.*.description')
        .optional()
        .isLength({ max: 30 }).withMessage('Detail description must be max 30 characters'),
    
    body('details.*.format')
        .optional()
        .isLength({ max: 50 }).withMessage('Format must be max 50 characters'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateUpdatePayMode = [
    param('id')
        .notEmpty().withMessage('Payment mode code is required')
        .isLength({ max: 8 }).withMessage('Payment mode code must be max 8 characters'),
    
    ...validateCreatePayMode.slice(0, -1),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateSearchPayModes = [
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
        .isIn(['0', '1', '']).withMessage('Invalid status value'),
    
    query('hasDetails')
        .optional()
        .isIn(['0', '1', '']).withMessage('Invalid has details value'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateCheckDuplicate = [
    query('phCode')
        .notEmpty().withMessage('Payment mode code is required')
        .isLength({ max: 8 }).withMessage('Payment mode code must be max 8 characters'),
    
    query('excludePhCode')
        .optional()
        .isLength({ max: 8 }).withMessage('Exclude payment mode code must be max 8 characters'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateCreatePayMode,
    validateUpdatePayMode,
    validateSearchPayModes,
    validateCheckDuplicate
};