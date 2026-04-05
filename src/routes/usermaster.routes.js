const express = require('express');
const router = express.Router();
const multer = require('multer');
const userMasterController = require('../controllers/usermaster.controller');
const {
    validateCreateUser,
    validateUpdateUser,
    validateSearchUsers,
    validateResetPassword,
    validateAssignLocations
} = require('../validators/usermaster.validator');
const { authenticateToken, checkUserStatus } = require('../middleware/auth.middleware');

// Configure multer for file upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(checkUserStatus);

// User CRUD operations
router.post('/', validateCreateUser, userMasterController.createUser);
router.get('/', validateSearchUsers, userMasterController.searchUsers);
router.get('/export', validateSearchUsers, userMasterController.exportUsers);
router.get('/check-duplicates', userMasterController.checkDuplicates);

// User-specific operations - note: param validation should be in the validator or controller
router.get('/:id', userMasterController.getUserById);
router.put('/:id', validateUpdateUser, userMasterController.updateUser);
router.delete('/:id', userMasterController.deleteUser);
router.post('/:id/reset-password', validateResetPassword, userMasterController.resetPassword);
router.post('/:id/photo', upload.single('photo'), userMasterController.uploadUserPhoto);

// Location management
router.get('/:id/locations', userMasterController.getUserLocations);
router.post('/:id/locations', validateAssignLocations, userMasterController.assignLocations);

module.exports = router;