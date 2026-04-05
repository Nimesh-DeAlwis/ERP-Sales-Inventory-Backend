const express = require('express');
const router = express.Router();
const payModeController = require('../controllers/paymode.controller');
const auth = require('../middleware/auth.middleware'); 
const { 
    validateCreatePayMode, 
    validateUpdatePayMode, 
    validateSearchPayModes, 
    validateCheckDuplicate 
} = require('../validators/paymode.validator');

const authMiddleware = require('../middleware/auth.middleware');

// Payment mode routes
router.post('/', validateCreatePayMode, payModeController.createPayMode);
router.get('/', payModeController.getAllPayModes);
router.get('/search', validateSearchPayModes, payModeController.searchPayModes);
router.get('/check-duplicate', validateCheckDuplicate, payModeController.checkDuplicatePayModeCode);
router.get('/:id', payModeController.getPayModeByCode);
router.get('/:id/details', payModeController.getPayModeDetails);
router.put('/:id', validateUpdatePayMode, payModeController.updatePayMode);
router.delete('/:id', payModeController.deletePayMode);

module.exports = router;