const { body, query, param, validationResult } = require('express-validator');

const validateCreateSubDepartment = [
    body('subDepartmentCode')
        .notEmpty().withMessage('Sub Department code is required')
        .isLength({ min: 1, max: 4 }).withMessage('Sub Department code must be 1-4 characters')
        .matches(/^[A-Z0-9]+$/).withMessage('Sub Department code can only contain uppercase letters and numbers'),
    
    body('description')
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 50 }).withMessage('Description must be max 50 characters'),
    
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

const validateUpdateSubDepartment = [
    param('id')
        .notEmpty().withMessage('Sub Department code is required')
        .isLength({ max: 4 }).withMessage('Sub Department code must be max 4 characters'),
    
    body('subDepartmentCode')
        .optional()
        .isLength({ min: 1, max: 4 }).withMessage('Sub Department code must be 1-4 characters')
        .matches(/^[A-Z0-9]+$/).withMessage('Sub Department code can only contain uppercase letters and numbers'),
    
    body('description')
        .optional()
        .isLength({ max: 50 }).withMessage('Description must be max 50 characters'),
    
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

const validateSearchSubDepartments = [
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
    query('subDepartmentCode')
        .notEmpty().withMessage('Sub Department code is required')
        .isLength({ max: 4 }).withMessage('Sub Department code must be max 4 characters'),
    
    query('excludeSubDepartmentCode')
        .optional()
        .isLength({ max: 4 }).withMessage('Exclude sub department code must be max 4 characters'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateCreateSubDepartment,
    validateUpdateSubDepartment,
    validateSearchSubDepartments,
    validateCheckDuplicate
};