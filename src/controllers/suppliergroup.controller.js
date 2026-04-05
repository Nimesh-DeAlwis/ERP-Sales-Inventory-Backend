const supplierGroupService = require('../services/suppliergroup.service');

// Get all supplier groups (for dropdown)
const getAllSupplierGroups = async (req, res) => {
    try {
        const groups = await supplierGroupService.getAllSupplierGroups();
        
        res.json({
            success: true,
            data: groups
        });
    } catch (error) {
        console.error('Get all supplier groups error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get next supplier group code
const getNextSupplierGroupCode = async (req, res) => {
    try {
        const nextCode = await supplierGroupService.getNextSupplierGroupCode();
        
        res.json({
            success: true,
            data: nextCode
        });
    } catch (error) {
        console.error('Get next supplier group code error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create supplier group
const createSupplierGroup = async (req, res) => {
    try {
        const groupData = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await supplierGroupService.createSupplierGroup(groupData, currentUser);

        res.status(201).json({
            success: true,
            message: 'Supplier group created successfully',
            data: result
        });
    } catch (error) {
        console.error('Create supplier group error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update supplier group
const updateSupplierGroup = async (req, res) => {
    try {
        const groupCode = req.params.id;
        const groupData = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await supplierGroupService.updateSupplierGroup(groupCode, groupData, currentUser);

        res.json({
            success: true,
            message: 'Supplier group updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Update supplier group error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get supplier group by code
const getSupplierGroupByCode = async (req, res) => {
    try {
        const groupCode = req.params.id;

        const result = await supplierGroupService.getSupplierGroupByCode(groupCode);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Supplier group not found'
            });
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get supplier group error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Search supplier groups
const searchSupplierGroups = async (req, res) => {
    try {
        const searchCriteria = req.query;

        const result = await supplierGroupService.searchSupplierGroups(searchCriteria);

        res.json({
            success: true,
            data: result.groups,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Search supplier groups error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete supplier group
const deleteSupplierGroup = async (req, res) => {
    try {
        const groupCode = req.params.id;
        const currentUser = req.user?.userId || 'SYSTEM';

        await supplierGroupService.deleteSupplierGroup(groupCode, currentUser);

        res.json({
            success: true,
            message: 'Supplier group deleted successfully'
        });
    } catch (error) {
        console.error('Delete supplier group error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Check duplicate supplier group code
const checkDuplicateSupplierGroupCode = async (req, res) => {
    try {
        const { groupCode } = req.query;
        const excludeGroupCode = req.query.excludeGroupCode || null;

        if (!groupCode) {
            return res.status(400).json({
                success: false,
                message: 'Supplier group code is required'
            });
        }

        const exists = await supplierGroupService.checkDuplicateSupplierGroupCode(groupCode, excludeGroupCode);

        res.json({
            success: true,
            exists,
            message: exists ? `Supplier group code '${groupCode}' already exists` : 'Supplier group code available'
        });
    } catch (error) {
        console.error('Check duplicate supplier group code error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createSupplierGroup,
    updateSupplierGroup,
    getSupplierGroupByCode,
    searchSupplierGroups,
    deleteSupplierGroup,
    getAllSupplierGroups,
    checkDuplicateSupplierGroupCode,
    getNextSupplierGroupCode
};