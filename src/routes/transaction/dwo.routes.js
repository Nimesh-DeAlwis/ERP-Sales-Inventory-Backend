const express = require('express');
const router = express.Router();
const dwoController = require('../../controllers/transaction/dwo.controller');
const { 
    validateCreateDWO, 
    validateSearchDWO 
} = require('../../validators/transaction/dwo.validator');

// Public routes
router.get('/next-runno', dwoController.getNextRunNo);
router.get('/setup/:type', dwoController.getTransactionSetup);

// CRUD routes
router.post('/', validateCreateDWO, dwoController.createDWO);
router.put('/', validateCreateDWO, dwoController.updateDWO);
router.get('/search', validateSearchDWO, dwoController.searchDocuments);
router.post('/:type/:runNo/:comCode/:locFrom/process', dwoController.processDocument);
router.post('/:type/:runNo/:comCode/:locFrom/cancel', dwoController.cancelDocument);
router.get('/:type/:runNo/:comCode/:locFrom/print', dwoController.printDocument);
router.get('/:type/:runNo/:comCode/:locFrom?', dwoController.getDocumentByNo);

module.exports = router;