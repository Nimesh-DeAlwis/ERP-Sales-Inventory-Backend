const express = require('express');
const router = express.Router();
const coiController = require('../../controllers/sales/coi.controller');
const { 
    validateCreateCOI, 
    validateSearchCOI 
} = require('../../validators/sales/coi.validator');

// Public routes
router.get('/next-runno', coiController.getNextRunNo);
router.get('/setup/:type', coiController.getTransactionSetup);

// CRUD routes
router.post('/', validateCreateCOI, coiController.createInvoice);
router.post('/:type/:runNo/:comCode/:locFrom/cancel', coiController.cancelInvoice);
router.get('/search', validateSearchCOI, coiController.searchDocuments);
router.get('/:type/:runNo/:comCode/:locFrom/print', coiController.printDocument);
router.get('/:type/:runNo/:comCode/:locFrom?', coiController.getDocumentByNo);

console.log('Corporate Invoice routes loaded successfully');

module.exports = router;