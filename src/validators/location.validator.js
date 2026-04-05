const { body, query, param, validationResult } = require('express-validator');

const validateCreateLocation = [
    body('locationCode')
        .notEmpty().withMessage('Location code is required')
        .isLength({ min: 1, max: 6 }).withMessage('Location code must be 1-6 characters')
        .matches(/^[A-Z0-9]+$/).withMessage('Location code can only contain uppercase letters and numbers'),
    
    body('description')
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 500 }).withMessage('Description must be max 500 characters'),
    
    body('isActive')
        .optional()
        .isBoolean().withMessage('Active status must be boolean'),
    
    body('mainLocation')
        .optional()
        .isLength({ max: 5 }).withMessage('Main location must be max 5 characters'),
    
    body('phone1')
        .optional({ checkFalsy: true }) // Allows null, undefined, empty string
        .isLength({ max: 12 }).withMessage('Phone 1 must be max 12 characters')
        .custom(value => {
            if (!value) return true; // Allow empty values
            const phoneRegex = /^[0-9+\-\s]{10,12}$/;
            return phoneRegex.test(value) || 'Invalid phone number format';
        }),
    
    body('phone2')
        .optional({ checkFalsy: true })
        .isLength({ max: 12 }).withMessage('Phone 2 must be max 12 characters')
        .custom(value => {
            if (!value) return true;
            const phoneRegex = /^[0-9+\-\s]{10,12}$/;
            return phoneRegex.test(value) || 'Invalid phone number format';
        }),
    
    body('mobile1')
        .optional({ checkFalsy: true })
        .isLength({ max: 12 }).withMessage('Mobile 1 must be max 12 characters')
        .custom(value => {
            if (!value) return true;
            const phoneRegex = /^[0-9+\-\s]{10,12}$/;
            return phoneRegex.test(value) || 'Invalid mobile number format';
        }),
    
    body('mobile2')
        .optional({ checkFalsy: true })
        .isLength({ max: 12 }).withMessage('Mobile 2 must be max 12 characters')
        .custom(value => {
            if (!value) return true;
            const phoneRegex = /^[0-9+\-\s]{10,12}$/;
            return phoneRegex.test(value) || 'Invalid mobile number format';
        }),
    
    body('email')
        .optional({ checkFalsy: true }) // This is the key fix!
        .isEmail().withMessage('Invalid email format')
        .isLength({ max: 255 }).withMessage('Email must be max 255 characters'),
    
    body('address1')
        .optional({ checkFalsy: true })
        .isLength({ max: 100 }).withMessage('Address 1 must be max 100 characters'),
    
    body('address2')
        .optional({ checkFalsy: true })
        .isLength({ max: 100 }).withMessage('Address 2 must be max 100 characters'),
    
    body('address3')
        .optional({ checkFalsy: true })
        .isLength({ max: 100 }).withMessage('Address 3 must be max 100 characters'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateUpdateLocation = [
    param('id')
        .notEmpty().withMessage('Location code is required')
        .isLength({ max: 6 }).withMessage('Location code must be max 6 characters'),
    
    ...validateCreateLocation.slice(0, -1),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateSearchLocations = [
    query('searchText')
        .optional()
        .isLength({ max: 100 }).withMessage('Search text too long'),
    
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
    query('pageSize')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Page size must be between 1 and 100'),
    
    query('isActive')
        .optional()
        .isIn(['0', '1', 'true', 'false']).withMessage('Invalid active status value'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateCheckDuplicate = [
    query('locationCode')
        .notEmpty().withMessage('Location code is required')
        .isLength({ max: 6 }).withMessage('Location code must be max 6 characters'),
    
    query('excludeLocationCode')
        .optional()
        .isLength({ max: 6 }).withMessage('Exclude location code must be max 6 characters'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateCreateLocation,
    validateUpdateLocation,
    validateSearchLocations,
    validateCheckDuplicate
};