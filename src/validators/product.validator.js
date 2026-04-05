const { body, query, param, validationResult } = require('express-validator');

const validateCreateProduct = [
    body('productCode')
        .notEmpty().withMessage('Product code is required')
        .isLength({ max: 25 }).withMessage('Product code must be max 25 characters'),
    
    body('description')
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 500 }).withMessage('Description must be max 500 characters'),
    
    body('stockCode')
        .notEmpty().withMessage('Stock code is required')
        .isLength({ max: 25 }).withMessage('Stock code must be max 25 characters'),
    
    body('unitCode')
        .notEmpty().withMessage('Unit is required'),
    
    body('costPrice')
        .notEmpty().withMessage('Cost price is required')
        .isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
    
    body('sellingPrice')
        .notEmpty().withMessage('Selling price is required')
        .isFloat({ min: 0 }).withMessage('Selling price must be a positive number'),
    
    body('active')
        .optional()
        .isBoolean().withMessage('Active must be boolean'),
    
    body('noDisc')
        .optional()
        .isInt().withMessage('No discount must be an integer'),
    
    body('minusAllow')
        .optional()
        .isBoolean().withMessage('Minus allow must be boolean'),
    
    body('exchangable')
        .optional()
        .isBoolean().withMessage('Exchangable must be boolean'),
    
    body('allowCostZero')
        .optional()
        .isInt().withMessage('Allow cost zero must be an integer'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateUpdateProduct = [
    param('id')
        .notEmpty().withMessage('Product code is required'),
    
    ...validateCreateProduct.slice(0, -1),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateSearchProducts = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
    query('pageSize')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Page size must be between 1 and 100'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateCheckDuplicate = [
    query('productCode')
        .notEmpty().withMessage('Product code is required'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateCreateProduct,
    validateUpdateProduct,
    validateSearchProducts,
    validateCheckDuplicate
};