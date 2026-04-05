const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brand.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { 
    validateCreateBrand, 
    validateUpdateBrand, 
    validateSearchBrands, 
    validateCheckDuplicate 
} = require('../validators/brand.validator');

// Public route - must come BEFORE auth middleware
router.get('/next-code', brandController.getNextBrandCode);

// Apply authentication middleware to all routes after public routes
const { authenticateToken, checkUserStatus } = require('../middleware/auth.middleware');

// Brand routes
router.post('/', validateCreateBrand, brandController.createBrand);
router.get('/', brandController.getAllBrands);
router.get('/search', validateSearchBrands, brandController.searchBrands);
router.get('/check-duplicate', validateCheckDuplicate, brandController.checkDuplicateBrandCode);
router.get('/:id', brandController.getBrandByCode);
router.put('/:id', validateUpdateBrand, brandController.updateBrand);
router.delete('/:id', brandController.deleteBrand);

console.log('Brand routes loaded successfully');

module.exports = router;