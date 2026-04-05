// src/controllers/customergroup.controller.js
const customerGroupService = require('../services/customergroup.service');

// Get all customer groups (for dropdown)
const getAllCustomerGroups = async (req, res) => {
    try {
        const groups = await customerGroupService.getAllCustomerGroups();
        
        res.json({
            success: true,
            data: groups
        });
    } catch (error) {
        console.error('Get all customer groups error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Search customer groups - FIXED: This function must be properly defined
const searchCustomerGroups = async (req, res) => {
    try {
        const searchCriteria = req.query;
        console.log('Search criteria received:', searchCriteria);

        const result = await customerGroupService.searchCustomerGroups(searchCriteria);

        res.json({
            success: true,
            data: result.groups,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Search customer groups error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create customer group
const createCustomerGroup = async (req, res) => {
    try {
        const groupData = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await customerGroupService.createCustomerGroup(groupData, currentUser);

        res.status(201).json({
            success: true,
            message: 'Customer group created successfully',
            data: result
        });
    } catch (error) {
        console.error('Create customer group error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update customer group
const updateCustomerGroup = async (req, res) => {
    try {
        const groupCode = req.params.id;
        const groupData = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await customerGroupService.updateCustomerGroup(groupCode, groupData, currentUser);

        res.json({
            success: true,
            message: 'Customer group updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Update customer group error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get customer group by code
const getCustomerGroupByCode = async (req, res) => {
    try {
        const groupCode = req.params.id;
        console.log('Getting customer group by code:', groupCode);

        const result = await customerGroupService.getCustomerGroupByCode(groupCode);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Customer group not found'
            });
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get customer group error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete customer group
const deleteCustomerGroup = async (req, res) => {
    try {
        const groupCode = req.params.id;
        const currentUser = req.user?.userId || 'SYSTEM';

        await customerGroupService.deleteCustomerGroup(groupCode, currentUser);

        res.json({
            success: true,
            message: 'Customer group deleted successfully'
        });
    } catch (error) {
        console.error('Delete customer group error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Check duplicate customer group code
const checkDuplicateCustomerGroupCode = async (req, res) => {
    try {
        const { groupCode } = req.query;
        const excludeGroupCode = req.query.excludeGroupCode || null;

        if (!groupCode) {
            return res.status(400).json({
                success: false,
                message: 'Customer group code is required'
            });
        }

        const exists = await customerGroupService.checkDuplicateCustomerGroupCode(groupCode, excludeGroupCode);

        res.json({
            success: true,
            exists,
            message: exists ? `Customer group code '${groupCode}' already exists` : 'Customer group code available'
        });
    } catch (error) {
        console.error('Check duplicate customer group code error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Make sure ALL functions are exported
module.exports = {
    createCustomerGroup,
    updateCustomerGroup,
    getCustomerGroupByCode,
    searchCustomerGroups,  // This must be included
    deleteCustomerGroup,
    getAllCustomerGroups,
    checkDuplicateCustomerGroupCode
};