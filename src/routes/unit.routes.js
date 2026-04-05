const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unit.controller');
const auth = require('../middleware/auth.middleware'); 
const { validateCreateUnit, validateUpdateUnit, validateSearchUnits, validateCheckDuplicate } = require('../validators/unit.validator');

// Apply authentication middleware to all routes
const authMiddleware = require('../middleware/auth.middleware');

// Unit routes
router.get('/search', validateSearchUnits, unitController.searchUnits); 
router.post('/', validateCreateUnit, unitController.createUnit);
router.get('/', unitController.getAllUnits);
router.get('/check-duplicate', validateCheckDuplicate, unitController.checkDuplicateUnitCode);
router.get('/:id', unitController.getUnitByCode);
router.put('/:id', validateUpdateUnit, unitController.updateUnit);
router.delete('/:id', unitController.deleteUnit);

module.exports = router;