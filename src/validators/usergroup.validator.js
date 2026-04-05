const { body, query, param, validationResult } = require('express-validator');

const validateCreateUserGroup = [
    body('groupData.groupCode')
        .notEmpty().withMessage('Group code is required')
        .isLength({ min: 1, max: 5 }).withMessage('Group code must be 1-5 characters')
        .matches(/^[A-Z0-9]+$/).withMessage('Group code can only contain uppercase letters and numbers'),
    
    body('groupData.description')
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 100 }).withMessage('Description must be max 100 characters'),
    
    body('groupData.status')
        .optional()
        .isBoolean().withMessage('Status must be boolean'),
    
    body('details')
        .optional()
        .isArray().withMessage('Details must be an array'),
    
    body('details.*.menuTag')
        .optional()
        .isLength({ max: 10 }).withMessage('Menu tag must be max 10 characters'),
    
    body('details.*.menuRight')
        .optional()
        .matches(/^[01]{6}$/).withMessage('Menu right must be 6 digits of 0 or 1'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateUpdateUserGroup = [
    param('id')
        .notEmpty().withMessage('Group code is required')
        .isLength({ max: 5 }).withMessage('Group code must be max 5 characters'),
    
    ...validateCreateUserGroup.slice(0, -1),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateSearchUserGroups = [
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
    query('groupCode')
        .notEmpty().withMessage('Group code is required')
        .isLength({ max: 5 }).withMessage('Group code must be max 5 characters'),
    
    query('excludeGroupCode')
        .optional()
        .isLength({ max: 5 }).withMessage('Exclude group code must be max 5 characters'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateMenuRight = [
    body('permissions')
        .optional()
        .isObject().withMessage('Permissions must be an object'),
    
    body('menuRight')
        .optional()
        .matches(/^[01]{6}$/).withMessage('Menu right must be 6 digits of 0 or 1'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateCreateUserGroup,
    validateUpdateUserGroup,
    validateSearchUserGroups,
    validateCheckDuplicate,
    validateMenuRight
};