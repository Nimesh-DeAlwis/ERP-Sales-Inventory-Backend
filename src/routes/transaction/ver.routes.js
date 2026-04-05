const express = require('express');
const router = express.Router();
const verController = require('../../controllers/transaction/ver.controller');
const { 
    validateCreateVER, 
    validateSearchVER 
} = require('../../validators/transaction/ver.validator');

// Public routes
router.get('/next-runno', verController.getNextRunNo);
router.get('/setup/:type', verController.getTransactionSetup);

// CRUD routes
router.post('/', validateCreateVER, verController.createVER);
router.put('/', validateCreateVER, verController.updateVER);
router.get('/search', validateSearchVER, verController.searchDocuments);
router.post('/:type/:runNo/:comCode/:locFrom/process', verController.processDocument);
router.get('/:type/:runNo/:comCode/:locFrom/print', verController.printDocument);
router.get('/:type/:runNo/:comCode/:locFrom?', verController.getDocumentByNo);

console.log('Stock Verification routes loaded successfully');

module.exports = router;