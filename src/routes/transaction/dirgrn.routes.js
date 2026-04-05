const express = require('express');
const router = express.Router();
const dirgrnController = require('../../controllers/transaction/dirgrn.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { 
    validateCreateDIRGRN, 
    validateSearchDIRGRN 
} = require('../../validators/transaction/dirgrn.validator');


// Public routes
router.get('/next-runno', dirgrnController.getNextRunNo);
router.get('/setup/:type', dirgrnController.getTransactionSetup);

// Apply authentication middleware to all routes AFTER public routes
const { authenticateToken, checkUserStatus } = require('../../middleware/auth.middleware');

// CRUD routes
router.post('/', validateCreateDIRGRN, dirgrnController.createDirectGRN);
router.put('/', validateCreateDIRGRN, dirgrnController.updateDirectGRN);
router.get('/search', validateSearchDIRGRN, dirgrnController.searchDocuments);
router.post('/:type/:runNo/:comCode/:locFrom/process', dirgrnController.processDocument);
router.get('/:type/:runNo/:comCode/:locFrom/print', dirgrnController.printDocument);
router.get('/:type/:runNo/:comCode/:locFrom?', dirgrnController.getDocumentByNo);

console.log('Direct GRN routes loaded successfully');

module.exports = router;