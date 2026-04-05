const { body, query, param, validationResult } = require('express-validator');
const { UserMaster } = require('../models/usermaster.model');

const validateCreateUser = [
    body('firstName')
        .notEmpty().withMessage('First name is required')
        .isLength({ max: 100 }).withMessage('First name must be max 100 characters'),
    
    body('lastName')
        .optional()
        .isLength({ max: 100 }).withMessage('Last name must be max 100 characters'),
    
    body('userGroup')
        .notEmpty().withMessage('User group is required')
        .isLength({ max: 20 }).withMessage('User group must be max 20 characters'),
    
    body('nic')
        .notEmpty().withMessage('NIC is required')
        .isLength({ min: 10, max: 12 }).withMessage('NIC must be 10 or 12 characters')
        .custom((value) => {
            // Validate NIC format
            const oldNicRegex = /^[0-9]{9}[VXvx]$/;
            const newNicRegex = /^[0-9]{12}$/;
            
            if (!oldNicRegex.test(value) && !newNicRegex.test(value)) {
                throw new Error('Invalid NIC format');
            }
            return true;
        }),
    
    body('mobile')
        .optional()
        .custom((value) => {
            if (value && !UserMaster.validatePhoneNumber(value)) {
                throw new Error('Invalid phone number format');
            }
            return true;
        }),
    
    body('email')
        .optional()
        .isEmail().withMessage('Invalid email format')
        .isLength({ max: 100 }).withMessage('Email must be max 100 characters'),
    
    body('address')
        .optional()
        .isLength({ max: 50 }).withMessage('Address must be max 50 characters'),
    
    body('gender')
        .optional()
        .isIn(['M', 'F', '']).withMessage('Gender must be M, F or empty'),
    
    body('dob')
        .optional()
        .isDate().withMessage('Invalid date format'),
    
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

const validateUpdateUser = [
    // Make NIC optional for updates
    body('nic')
        .optional({ checkFalsy: true }) // Make it optional
        .isLength({ min: 10, max: 12 }).withMessage('NIC must be 10 or 12 characters')
        .custom((value) => {
            if (value) { // Only validate if NIC is provided
                const oldNicRegex = /^[0-9]{9}[VXvx]$/;
                const newNicRegex = /^[0-9]{12}$/;
                
                if (!oldNicRegex.test(value) && !newNicRegex.test(value)) {
                    throw new Error('Invalid NIC format');
                }
            }
            return true;
        }),
    
    // Keep other validators but update their requirements
    body('firstName')
        .notEmpty().withMessage('First name is required')
        .isLength({ max: 100 }).withMessage('First name must be max 100 characters'),
    
    body('lastName')
        .optional()
        .isLength({ max: 100 }).withMessage('Last name must be max 100 characters'),
    
    body('userGroup')
        .notEmpty().withMessage('User group is required')
        .isLength({ max: 20 }).withMessage('User group must be max 20 characters'),
    
    body('mobile')
        .optional()
        .custom((value) => {
            if (value && !UserMaster.validatePhoneNumber(value)) {
                throw new Error('Invalid phone number format');
            }
            return true;
        }),

    body('email')
    .optional()
    .isEmail().withMessage('Invalid email format')
    .isLength({ max: 100 }).withMessage('Email must be max 100 characters'),
    
    body('address')
        .optional()
        .isLength({ max: 50 }).withMessage('Address must be max 50 characters'),
    
    body('gender')
        .optional()
        .isIn(['M', 'F', '']).withMessage('Gender must be M, F or empty'),
    
    body('dob')
        .optional({ checkFalsy: true }) // Allows null
        .isDate().withMessage('Invalid date format'),
    
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

const validateSearchUsers = [
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

const validateResetPassword = [
    param('id')
        .notEmpty().withMessage('User ID is required'),
    
    body('newPassword')
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateAssignLocations = [
    param('id')
        .notEmpty().withMessage('User ID is required'),
    
    body('locations')
        .isArray().withMessage('Locations must be an array')
        .notEmpty().withMessage('At least one location is required'),
    
    body('locations.*.locationCode')
        .notEmpty().withMessage('Location code is required')
        .isLength({ max: 5 }).withMessage('Location code must be max 5 characters'),
    
    body('locations.*.dateFrom')
        .optional()
        .isDate().withMessage('Invalid date from format'),
    
    body('locations.*.dateTo')
        .optional()
        .isDate().withMessage('Invalid date to format'),
    
    body('locations.*.isActive')
        .optional()
        .isBoolean().withMessage('Active status must be boolean'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateCreateUser,
    validateUpdateUser,
    validateSearchUsers,
    validateResetPassword,
    validateAssignLocations
};