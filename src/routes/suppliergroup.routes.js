const express = require('express');
const router = express.Router();
const supplierGroupController = require('../controllers/suppliergroup.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { 
    validateCreateSupplierGroup, 
    validateUpdateSupplierGroup, 
    validateSearchSupplierGroups, 
    validateCheckDuplicate 
} = require('../validators/suppliergroup.validator');

// Public route (no auth required) - must come BEFORE auth middleware
router.get('/next-code', supplierGroupController.getNextSupplierGroupCode);

// Apply authentication middleware to all routes after public routes
const { authenticateToken, checkUserStatus } = require('../middleware/auth.middleware');

// Supplier group routes
router.post('/', validateCreateSupplierGroup, supplierGroupController.createSupplierGroup);
router.get('/', supplierGroupController.getAllSupplierGroups);
router.get('/search', validateSearchSupplierGroups, supplierGroupController.searchSupplierGroups);
router.get('/check-duplicate', validateCheckDuplicate, supplierGroupController.checkDuplicateSupplierGroupCode);
router.get('/:id', supplierGroupController.getSupplierGroupByCode);
router.put('/:id', validateUpdateSupplierGroup, supplierGroupController.updateSupplierGroup);
router.delete('/:id', supplierGroupController.deleteSupplierGroup);

console.log('Supplier group routes loaded successfully');

module.exports = router;