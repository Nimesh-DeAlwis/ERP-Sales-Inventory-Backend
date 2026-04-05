const express = require('express');
const router = express.Router();
const userGroupController = require('../controllers/usergroup.controller');
const {
    validateCreateUserGroup,
    validateUpdateUserGroup,
    validateSearchUserGroups,
    validateCheckDuplicate,
    validateMenuRight
} = require('../validators/usergroup.validator');
const { authenticateToken, checkUserStatus } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(checkUserStatus);

// User group CRUD operations
router.get('/all', userGroupController.getAllUserGroups);// Get all user groups
router.post('/', validateCreateUserGroup, userGroupController.createUserGroup);
router.get('/', validateSearchUserGroups, userGroupController.searchUserGroups);
router.get('/check-duplicate', validateCheckDuplicate, userGroupController.checkDuplicateGroupCode);
router.get('/menus/all', userGroupController.getAllMenus);

// User group specific operations
router.get('/:id', userGroupController.getUserGroupById);
router.put('/:id', validateUpdateUserGroup, userGroupController.updateUserGroup);
router.delete('/:id', userGroupController.deleteUserGroup);
router.get('/:id/user-count', userGroupController.getUserCountByGroup);

// Menu operations
router.get('/menus/for-group', userGroupController.getMenusForGroup);
router.get('/menus/for-group', userGroupController.getMenusForGroup);

// Menu right utilities
router.post('/menu-right/generate', validateMenuRight, userGroupController.generateMenuRight);
router.post('/menu-right/parse', validateMenuRight, userGroupController.parseMenuRight);

module.exports = router;