const express = require('express');
const router = express.Router();
const quoController = require('../../controllers/sales/quo.controller');
const { 
    validateCreateQUO, 
    validateSearchQUO 
} = require('../../validators/sales/quo.validator');

// Public routes
router.get('/next-runno', quoController.getNextRunNo);
router.get('/setup/:type', quoController.getTransactionSetup);

// CRUD routes
router.post('/', validateCreateQUO, quoController.createQuotation);
router.put('/', validateCreateQUO, quoController.updateQuotation);
router.get('/search', validateSearchQUO, quoController.searchDocuments);
router.post('/:type/:runNo/:comCode/:locFrom/cancel', quoController.cancelDocument);
router.get('/:type/:runNo/:comCode/:locFrom/print', quoController.printDocument);
router.get('/:type/:runNo/:comCode/:locFrom?', quoController.getDocumentByNo);

console.log('Quotation routes loaded successfully');

module.exports = router;