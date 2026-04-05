// src/controllers/unit.controller.js
const unitService = require('../services/unit.service');

// Get all units (for dropdown)
const getAllUnits = async (req, res) => {
    try {
        console.log('Getting all units');
        const units = await unitService.getAllUnits();
        
        res.json({
            success: true,
            data: units
        });
    } catch (error) {
        console.error('Get all units error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Search units with pagination
const searchUnits = async (req, res) => {
    try {
        const searchCriteria = req.query;
        console.log('Search units with criteria:', searchCriteria);

        const result = await unitService.searchUnits(searchCriteria);

        res.json({
            success: true,
            data: result.units,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Search units error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create unit
const createUnit = async (req, res) => {
    try {
        const unitData = req.body;
        const currentUser = req.user?.userId || 'SYSTEM'; // Add fallback

        console.log('Creating unit:', unitData);
        const result = await unitService.createUnit(unitData, currentUser);

        res.status(201).json({
            success: true,
            message: 'Unit created successfully',
            data: result
        });
    } catch (error) {
        console.error('Create unit error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update unit
const updateUnit = async (req, res) => {
    try {
        const unitCode = req.params.id;
        const unitData = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        console.log('Updating unit:', unitCode, unitData);
        const result = await unitService.updateUnit(unitCode, unitData, currentUser);

        res.json({
            success: true,
            message: 'Unit updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Update unit error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get unit by code
const getUnitByCode = async (req, res) => {
    try {
        const unitCode = req.params.id;
        console.log('Getting unit by code:', unitCode);

        const result = await unitService.getUnitByCode(unitCode);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Unit not found'
            });
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get unit error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete unit
const deleteUnit = async (req, res) => {
    try {
        const unitCode = req.params.id;
        const currentUser = req.user?.userId || 'SYSTEM';

        console.log('Deleting unit:', unitCode);
        await unitService.deleteUnit(unitCode, currentUser);

        res.json({
            success: true,
            message: 'Unit deleted successfully'
        });
    } catch (error) {
        console.error('Delete unit error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Check duplicate unit code
const checkDuplicateUnitCode = async (req, res) => {
    try {
        const { unitCode } = req.query;
        const excludeUnitCode = req.query.excludeUnitCode || null;

        console.log('Checking duplicate unit code:', unitCode, 'exclude:', excludeUnitCode);

        if (!unitCode) {
            return res.status(400).json({
                success: false,
                message: 'Unit code is required'
            });
        }

        const exists = await unitService.checkDuplicateUnitCode(unitCode, excludeUnitCode);

        res.json({
            success: true,
            exists,
            message: exists ? `Unit code '${unitCode}' already exists` : 'Unit code available'
        });
    } catch (error) {
        console.error('Check duplicate unit code error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createUnit,
    updateUnit,
    getUnitByCode,
    searchUnits,
    deleteUnit,
    getAllUnits,
    checkDuplicateUnitCode
};