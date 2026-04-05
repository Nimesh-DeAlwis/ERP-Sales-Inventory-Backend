const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { 
    validateCreateDepartment, 
    validateUpdateDepartment, 
    validateSearchDepartments, 
    validateCheckDuplicate 
} = require('../validators/department.validator');

// Public route - must come BEFORE auth middleware
router.get('/next-code', departmentController.getNextDepartmentCode);

// Apply authentication middleware to all routes after public routes
const { authenticateToken, checkUserStatus } = require('../middleware/auth.middleware');
// Department routes
router.post('/', validateCreateDepartment, departmentController.createDepartment);
router.get('/', departmentController.getAllDepartments);
router.get('/search', validateSearchDepartments, departmentController.searchDepartments);
router.get('/check-duplicate', validateCheckDuplicate, departmentController.checkDuplicateDepartmentCode);
router.get('/:id', departmentController.getDepartmentByCode);
router.put('/:id', validateUpdateDepartment, departmentController.updateDepartment);
router.delete('/:id', departmentController.deleteDepartment);

console.log('Department routes loaded successfully');

module.exports = router;