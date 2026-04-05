const express = require('express');
const router = express.Router();
const usgController = require('../../controllers/transaction/usg.controller');
const { 
    validateCreateUSG, 
    validateSearchUSG 
} = require('../../validators/transaction/usg.validator');

// Public routes
router.get('/next-runno', usgController.getNextRunNo);
router.get('/setup/:type', usgController.getTransactionSetup);

// CRUD routes
router.post('/', validateCreateUSG, usgController.createUSG);
router.put('/', validateCreateUSG, usgController.updateUSG);
router.get('/search', validateSearchUSG, usgController.searchDocuments);
router.post('/:type/:runNo/:comCode/:locFrom/process', usgController.processDocument);
router.get('/:type/:runNo/:comCode/:locFrom/print', usgController.printDocument);
router.get('/:type/:runNo/:comCode/:locFrom?', usgController.getDocumentByNo);



module.exports = router;