const express = require('express');
const router = express.Router();
const subDepartmentController = require('../controllers/subdepartment.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { 
    validateCreateSubDepartment, 
    validateUpdateSubDepartment, 
    validateSearchSubDepartments, 
    validateCheckDuplicate 
} = require('../validators/subdepartment.validator');

// Public route - must come BEFORE auth middleware
router.get('/next-code', subDepartmentController.getNextSubDepartmentCode);

// Apply authentication middleware to all routes after public routes
const { authenticateToken, checkUserStatus } = require('../middleware/auth.middleware');


// Sub Department routes
router.post('/', validateCreateSubDepartment, subDepartmentController.createSubDepartment);
router.get('/', subDepartmentController.getAllSubDepartments);
router.get('/search', validateSearchSubDepartments, subDepartmentController.searchSubDepartments);
router.get('/check-duplicate', validateCheckDuplicate, subDepartmentController.checkDuplicateSubDepartmentCode);
router.get('/:id', subDepartmentController.getSubDepartmentByCode);
router.put('/:id', validateUpdateSubDepartment, subDepartmentController.updateSubDepartment);
router.delete('/:id', subDepartmentController.deleteSubDepartment);

console.log('Sub Department routes loaded successfully');

module.exports = router;