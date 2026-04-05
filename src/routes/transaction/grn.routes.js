const express = require('express');
const router = express.Router();
const grnController = require('../../controllers/transaction/grn.controller');
const { 
    validateCreateGRN, 
    validateSearchGRN 
} = require('../../validators/transaction/grn.validator');

// Public routes
router.get('/next-runno', grnController.getNextRunNo);
router.get('/setup/:type', grnController.getTransactionSetup);
router.get('/po/search', grnController.searchPODocuments);
router.get('/po/:poType/:poRunNo/:comCode/:locFrom', grnController.getPODocument);

// CRUD routes
router.post('/', validateCreateGRN, grnController.createGRN);
router.put('/', validateCreateGRN, grnController.updateGRN);
router.get('/search', validateSearchGRN, grnController.searchDocuments);
router.post('/:type/:runNo/:comCode/:locFrom/process', grnController.processDocument);
router.post('/:type/:runNo/:comCode/:locFrom/cancel', grnController.cancelDocument);
router.get('/:type/:runNo/:comCode/:locFrom/print', grnController.printDocument);
router.get('/:type/:runNo/:comCode/:locFrom?', grnController.getDocumentByNo);

console.log('GRN routes loaded successfully');

module.exports = router;