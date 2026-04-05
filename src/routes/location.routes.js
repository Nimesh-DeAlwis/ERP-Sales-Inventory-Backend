const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');
const {
    validateCreateLocation,
    validateUpdateLocation,
    validateSearchLocations,
    validateCheckDuplicate
} = require('../validators/location.validator');
const { authenticateToken, checkUserStatus } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(checkUserStatus);

// Location CRUD operations
router.post('/', validateCreateLocation, locationController.createLocation);
router.get('/', validateSearchLocations, locationController.getAllLocations);
router.get('/check-duplicate', validateCheckDuplicate, locationController.checkDuplicateLocationCode);

// Public endpoints (no auth required for dropdowns)
router.get('/active', locationController.getAllActiveLocations);
router.get('/dropdown', locationController.getLocationsForDropdown);

// Location specific operations
router.get('/:id', locationController.getLocationById);
router.put('/:id', validateUpdateLocation, locationController.updateLocation);
router.delete('/:id', locationController.deleteLocation);

module.exports = router;