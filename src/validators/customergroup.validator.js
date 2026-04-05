// src/validators/customergroup.validator.js
const { body, query, param, validationResult } = require('express-validator');

const validateCreateCustomerGroup = [
    body('groupCode')
        .notEmpty().withMessage('Group code is required')
        .isLength({ min: 1, max: 8 }).withMessage('Group code must be 1-8 characters')
        .matches(/^[A-Z0-9]+$/).withMessage('Group code can only contain uppercase letters and numbers'),
    
    body('description')
        .notEmpty().withMessage('Description is required'),
    
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

const validateUpdateCustomerGroup = [
    param('id')
        .notEmpty().withMessage('Group code is required')
        .isLength({ max: 8 }).withMessage('Group code must be max 8 characters'),
    
    body('groupCode')
        .optional()
        .isLength({ min: 1, max: 8 }).withMessage('Group code must be 1-8 characters')
        .matches(/^[A-Z0-9]+$/).withMessage('Group code can only contain uppercase letters and numbers'),
    
    body('description')
        .optional(),
    
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

const validateSearchCustomerGroups = [
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
        .isIn(['0', '1', 'true', 'false', '']).withMessage('Invalid status value'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateCheckDuplicate = [
    query('groupCode')
        .notEmpty().withMessage('Group code is required')
        .isLength({ max: 8 }).withMessage('Group code must be max 8 characters'),
    
    query('excludeGroupCode')
        .optional()
        .isLength({ max: 8 }).withMessage('Exclude group code must be max 8 characters'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateCreateCustomerGroup,
    validateUpdateCustomerGroup,
    validateSearchCustomerGroups,
    validateCheckDuplicate
};