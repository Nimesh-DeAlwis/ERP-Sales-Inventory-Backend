const express = require('express');
const router = express.Router();
const corController = require('../../controllers/sales/cor.controller');
const { 
    validateCreateCOR, 
    validateSearchCOR 
} = require('../../validators/sales/cor.validator');

// Public routes
router.get('/next-runno', corController.getNextRunNo);
router.get('/setup/:type', corController.getTransactionSetup);
router.get('/coi/search', corController.searchCOIDocuments);
router.get('/coi/:coiType/:coiRunNo/:comCode/:locFrom', corController.getCOIDocument);

// CRUD routes
router.post('/', validateCreateCOR, corController.createSalesReturn);
router.post('/:type/:runNo/:comCode/:locFrom/cancel', corController.cancelReturn);
router.get('/search', validateSearchCOR, corController.searchDocuments);
router.get('/:type/:runNo/:comCode/:locFrom/print', corController.printDocument);
router.get('/:type/:runNo/:comCode/:locFrom?', corController.getDocumentByNo);

console.log('Sales Return routes loaded successfully');

module.exports = router;