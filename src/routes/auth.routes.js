const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateLogin, validateLocation } = require('../validators/auth.validator');

// Debug: Check if controller functions exist
console.log('Auth controller functions:');
console.log('login:', typeof authController.login);
console.log('getLocations:', typeof authController.getLocations);
console.log('verifyLocation:', typeof authController.verifyLocation);
console.log('logout:', typeof authController.logout);
console.log('checkSession:', typeof authController.checkSession);

// Make sure all routes use valid controller functions
router.post('/login', validateLogin, authController.login);
router.post('/get-locations', authController.getLocations);
router.post('/verify-location', validateLocation, authController.verifyLocation); // Fixed: was verifyLocationAndLoadMenus
router.post('/logout', authController.logout);
router.get('/session', authController.checkSession);

module.exports = router;