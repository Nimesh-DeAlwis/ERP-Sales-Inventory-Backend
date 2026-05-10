const express = require('express');
const router = express.Router();
const evGroupController = require('../../../controllers/vouchers/evoucher/evgroup.controller');
const { 
    validateCreateEVGroup, 
    validateUpdateEVGroup,
    validateSearchEVGroup 
} = require('../../../validators/vouchers/evoucher/evgroup.validator');

// Public routes
router.get('/next-code', evGroupController.getNextCode);
router.get('/all', evGroupController.getAllEVGroups);

// CRUD routes
router.post('/', validateCreateEVGroup, evGroupController.createEVGroup);
router.put('/:code', validateUpdateEVGroup, evGroupController.updateEVGroup);
router.delete('/:code', evGroupController.deleteEVGroup);
router.get('/search', validateSearchEVGroup, evGroupController.searchEVGroups);
router.get('/:code', evGroupController.getEVGroupByCode);
router.patch('/:code/status', evGroupController.updateStatus);

console.log('E-Voucher Group routes loaded successfully');

module.exports = router;