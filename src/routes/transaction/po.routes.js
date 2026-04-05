const express = require('express');
const router = express.Router();
const poController = require('../../controllers/transaction/po.controller');
const { 
    validateCreatePO, 
    validateSearchPO 
} = require('../../validators/transaction/po.validator');

// Public routes
router.get('/next-runno', poController.getNextRunNo);
router.get('/setup/:type', poController.getTransactionSetup);

// CRUD routes
router.post('/', validateCreatePO, poController.createPurchaseOrder);
router.put('/', validateCreatePO, poController.updatePurchaseOrder);
router.get('/search', validateSearchPO, poController.searchDocuments);
router.post('/:type/:runNo/:comCode/:locFrom/process', poController.processDocument);
router.get('/:type/:runNo/:comCode/:locFrom/print', poController.printDocument);
router.get('/:type/:runNo/:comCode/:locFrom?', poController.getDocumentByNo);

console.log('Purchase Order routes loaded successfully');

module.exports = router;