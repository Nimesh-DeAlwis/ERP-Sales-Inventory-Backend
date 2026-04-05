const { body, query, param, validationResult } = require('express-validator');

// Validation for creating a unit
const validateCreateUnit = [
    body('unitCode')
        .notEmpty().withMessage('Unit code is required')
        .isLength({ min: 1, max: 5 }).withMessage('Unit code must be 1-5 characters')
        .matches(/^[A-Z0-9]+$/).withMessage('Unit code can only contain uppercase letters and numbers'),
    
    body('description')
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 1000 }).withMessage('Description must be max 1000 characters'),
    
    body('status')
        .optional()
        .isBoolean().withMessage('Status must be boolean'),
    
    body('volume')
        .optional()
        .isNumeric().withMessage('Volume must be a number')
        .custom(value => value >= 0).withMessage('Volume cannot be negative'),
    
    body('refCode')
        .optional()
        .isLength({ max: 10 }).withMessage('Reference code must be max 10 characters'),
    
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

// Validation for updating a unit
const validateUpdateUnit = [
    param('id')
        .notEmpty().withMessage('Unit code is required')
        .isLength({ max: 5 }).withMessage('Unit code must be max 5 characters'),
    
    body('unitCode')
        .optional()
        .isLength({ min: 1, max: 5 }).withMessage('Unit code must be 1-5 characters')
        .matches(/^[A-Z0-9]+$/).withMessage('Unit code can only contain uppercase letters and numbers'),
    
    body('description')
        .optional()
        .isLength({ max: 1000 }).withMessage('Description must be max 1000 characters'),
    
    body('status')
        .optional()
        .isBoolean().withMessage('Status must be boolean'),
    
    body('volume')
        .optional()
        .isNumeric().withMessage('Volume must be a number')
        .custom(value => value >= 0).withMessage('Volume cannot be negative'),
    
    body('refCode')
        .optional()
        .isLength({ max: 10 }).withMessage('Reference code must be max 10 characters'),
    
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

// Validation for searching units
const validateSearchUnits = [
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
    
    query('sortBy')
        .optional()
        .isIn(['UM_CODE', 'UM_DESC', 'UM_VOLUME', 'UM_REFCODE', 'unitCode', 'description', 'volume', 'refCode'])
        .withMessage('Invalid sort field'),
    
    query('sortOrder')
        .optional()
        .isIn(['ASC', 'DESC', 'asc', 'desc']).withMessage('Sort order must be ASC or DESC'),
    
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

// Validation for checking duplicate unit code
const validateCheckDuplicate = [
    query('unitCode')
        .notEmpty().withMessage('Unit code is required')
        .isLength({ max: 5 }).withMessage('Unit code must be max 5 characters'),
    
    query('excludeUnitCode')
        .optional()
        .isLength({ max: 5 }).withMessage('Exclude unit code must be max 5 characters'),
    
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

// Validation for getting unit by ID
const validateGetUnitById = [
    param('id')
        .notEmpty().withMessage('Unit code is required')
        .isLength({ max: 5 }).withMessage('Unit code must be max 5 characters'),
    
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

// Validation for deleting a unit
const validateDeleteUnit = [
    param('id')
        .notEmpty().withMessage('Unit code is required')
        .isLength({ max: 5 }).withMessage('Unit code must be max 5 characters'),
    
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
    validateCreateUnit,
    validateUpdateUnit,
    validateSearchUnits,
    validateCheckDuplicate,
    validateGetUnitById,
    validateDeleteUnit
};