const express = require('express');
const router = express.Router();
const pvGroupController = require('../../../controllers/vouchers/physicalvoucher/pvgroup.controller');
const { 
    validateCreatePVGroup, 
    validateUpdatePVGroup,
    validateSearchPVGroup 
} = require('../../../validators/vouchers/physicalvoucher/pvgroup.validator');

// Public routes
router.get('/next-code', pvGroupController.getNextCode);
router.get('/all', pvGroupController.getAllPVGroups);

// CRUD routes
router.post('/', validateCreatePVGroup, pvGroupController.createPVGroup);
router.put('/:code', validateUpdatePVGroup, pvGroupController.updatePVGroup);
router.delete('/:code', pvGroupController.deletePVGroup);
router.get('/search', validateSearchPVGroup, pvGroupController.searchPVGroups);
router.get('/:code', pvGroupController.getPVGroupByCode);
router.patch('/:code/status', pvGroupController.updateStatus);

console.log('Physical Voucher Group routes loaded successfully');

module.exports = router;