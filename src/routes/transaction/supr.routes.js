const express = require('express');
const router = express.Router();
const suprController = require('../../controllers/transaction/supr.controller');
const { 
    validateCreateSUPR, 
    validateSearchSUPR 
} = require('../../validators/transaction/supr.validator');

// Public routes
router.get('/next-runno', suprController.getNextRunNo);
router.get('/setup/:type', suprController.getTransactionSetup);
router.get('/grn/search', suprController.searchGRNDocuments);
router.get('/grn/:grnType/:grnRunNo/:comCode/:locFrom', suprController.getGRNDocument);

// CRUD routes
router.post('/', validateCreateSUPR, suprController.createSUPR);
router.put('/', validateCreateSUPR, suprController.updateSUPR);
router.get('/search', validateSearchSUPR, suprController.searchDocuments);
router.post('/:type/:runNo/:comCode/:locFrom/process', suprController.processDocument);
router.get('/:type/:runNo/:comCode/:locFrom/print', suprController.printDocument);
router.get('/:type/:runNo/:comCode/:locFrom?', suprController.getDocumentByNo);

console.log('Supplier Return routes loaded successfully');

module.exports = router;