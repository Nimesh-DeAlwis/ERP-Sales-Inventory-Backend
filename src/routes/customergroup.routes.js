const express = require('express');
const router = express.Router();
const customerGroupController = require('../controllers/customergroup.controller');
const auth = require('../middleware/auth.middleware'); 
const { 
    validateCreateCustomerGroup, 
    validateUpdateCustomerGroup, 
    validateSearchCustomerGroups, 
    validateCheckDuplicate 
} = require('../validators/customergroup.validator');

const authMiddleware = require('../middleware/auth.middleware');

// Customer group routes
router.get('/search', validateSearchCustomerGroups, customerGroupController.searchCustomerGroups);
router.get('/check-duplicate', validateCheckDuplicate, customerGroupController.checkDuplicateCustomerGroupCode);
router.post('/', validateCreateCustomerGroup, customerGroupController.createCustomerGroup);
router.get('/', customerGroupController.getAllCustomerGroups);
router.get('/:id', customerGroupController.getCustomerGroupByCode);
router.put('/:id', validateUpdateCustomerGroup, customerGroupController.updateCustomerGroup);
router.delete('/:id', customerGroupController.deleteCustomerGroup);

module.exports = router;