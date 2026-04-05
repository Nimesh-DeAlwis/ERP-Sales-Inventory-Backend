const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { 
    validateCreateSupplier, 
    validateUpdateSupplier, 
    validateSearchSuppliers, 
    validateCheckDuplicate 
} = require('../validators/supplier.validator');

// Public route - must come BEFORE auth middleware
router.get('/next-code', supplierController.getNextSupplierCode);

// Apply authentication middleware to all routes after public routes
const { authenticateToken, checkUserStatus } = require('../middleware/auth.middleware');

// Supplier routes
router.post('/', validateCreateSupplier, supplierController.createSupplier);
router.get('/search', validateSearchSuppliers, supplierController.searchSuppliers);
router.get('/check-duplicate', validateCheckDuplicate, supplierController.checkDuplicateSupplierCode);
router.get('/:id', supplierController.getSupplierByCode);
router.put('/:id', validateUpdateSupplier, supplierController.updateSupplier);
router.delete('/:id', supplierController.deleteSupplier);

console.log('Supplier routes loaded successfully');

module.exports = router;