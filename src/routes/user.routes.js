const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken, checkUserStatus } = require('../middleware/auth.middleware');

// All user routes require authentication
router.use(authenticateToken);
router.use(checkUserStatus);

router.get('/profile', userController.getUserProfile);
router.get('/permissions', userController.getUserPermissions);
router.put('/profile', userController.updateUserProfile);
router.put('/change-password', userController.changePassword);

module.exports = router;