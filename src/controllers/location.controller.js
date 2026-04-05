const locationService = require('../services/location.service');

// Create location
const createLocation = async (req, res) => {
    try {
        const locationData = req.body;
        const currentUser = req.user.userId;

        const result = await locationService.createLocation(locationData, currentUser);

        res.status(201).json({
            success: true,
            message: 'Location created successfully',
            data: result
        });
    } catch (error) {
        console.error('Create location error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update location
const updateLocation = async (req, res) => {
    try {
        const locationCode = req.params.id;
        const locationData = req.body;
        const currentUser = req.user.userId;

        const result = await locationService.updateLocation(locationCode, locationData, currentUser);

        res.json({
            success: true,
            message: 'Location updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Update location error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get location by ID
const getLocationById = async (req, res) => {
    try {
        const locationCode = req.params.id;

        const location = await locationService.getLocationById(locationCode);

        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        res.json({
            success: true,
            data: location
        });
    } catch (error) {
        console.error('Get location error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all active locations
const getAllActiveLocations = async (req, res) => {
    try {
        const locations = await locationService.getAllActiveLocations();

        res.json({
            success: true,
            data: locations
        });
    } catch (error) {
        console.error('Get all active locations error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all locations with pagination
const getAllLocations = async (req, res) => {
    try {
        const searchCriteria = req.query;

        const result = await locationService.getAllLocations(searchCriteria);

        res.json({
            success: true,
            data: result.locations,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Get all locations error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get locations for dropdown
const getLocationsForDropdown = async (req, res) => {
    try {
        const locations = await locationService.getLocationsForDropdown();

        res.json({
            success: true,
            data: locations
        });
    } catch (error) {
        console.error('Get locations for dropdown error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete location
const deleteLocation = async (req, res) => {
    try {
        const locationCode = req.params.id;
        const currentUser = req.user.userId;

        await locationService.deleteLocation(locationCode, currentUser);

        res.json({
            success: true,
            message: 'Location deleted successfully'
        });
    } catch (error) {
        console.error('Delete location error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Check duplicate location code
const checkDuplicateLocationCode = async (req, res) => {
    try {
        const { locationCode } = req.query;
        const excludeLocationCode = req.query.excludeLocationCode || null;

        if (!locationCode) {
            return res.status(400).json({
                success: false,
                message: 'Location code is required'
            });
        }

        const exists = await locationService.checkDuplicateLocationCode(locationCode, excludeLocationCode);

        res.json({
            success: true,
            exists,
            message: exists ? `Location code '${locationCode}' already exists` : 'Location code available'
        });
    } catch (error) {
        console.error('Check duplicate location code error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createLocation,
    updateLocation,
    getLocationById,
    getAllActiveLocations,
    getAllLocations,
    getLocationsForDropdown,
    deleteLocation,
    checkDuplicateLocationCode
};