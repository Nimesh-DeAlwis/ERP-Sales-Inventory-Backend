const express = require('express');
const router = express.Router();
const pvcpoController = require('../../../controllers/vouchers/physicalvoucher/pvcpo.controller');
const { 
    validateCreatePVCPO, 
    validateSearchPVCPO 
} = require('../../../validators/vouchers/physicalvoucher/pvcpo.validator');

// Public routes
router.get('/next-runno', pvcpoController.getNextRunNo);
router.get('/voucher-groups', pvcpoController.getVoucherGroups);

// CRUD routes
router.post('/', validateCreatePVCPO, pvcpoController.createPVCPO);
router.put('/', validateCreatePVCPO, pvcpoController.updatePVCPO);
router.get('/search', validateSearchPVCPO, pvcpoController.searchDocuments);
router.post('/:type/:runNo/process', pvcpoController.processDocument);
router.post('/:type/:runNo/cancel', pvcpoController.cancelDocument);
router.get('/:type/:runNo/print', pvcpoController.printDocument);
router.get('/:type/:runNo', pvcpoController.getDocumentByNo);

console.log('Physical Voucher PO routes loaded successfully');

module.exports = router;