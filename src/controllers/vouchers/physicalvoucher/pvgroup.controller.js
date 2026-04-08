const pvGroupService = require('../../../services/vouchers/physicalvoucher/pvgroup.service');

// Get next voucher group code
const getNextCode = async (req, res) => {
    try {
        const nextCode = await pvGroupService.getNextCode();
        
        res.json({
            success: true,
            data: nextCode
        });
    } catch (error) {
        console.error('Get next code error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create Voucher Group
const createPVGroup = async (req, res) => {
    try {
        const data = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await pvGroupService.createPVGroup(data, currentUser);

        res.status(201).json(result);
    } catch (error) {
        console.error('Create Voucher Group error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update Voucher Group
const updatePVGroup = async (req, res) => {
    try {
        const { code } = req.params;
        const data = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await pvGroupService.updatePVGroup(code, data, currentUser);

        res.json(result);
    } catch (error) {
        console.error('Update Voucher Group error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Delete Voucher Group
const deletePVGroup = async (req, res) => {
    try {
        const { code } = req.params;

        const result = await pvGroupService.deletePVGroup(code);

        res.json(result);
    } catch (error) {
        console.error('Delete Voucher Group error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get Voucher Group by code
const getPVGroupByCode = async (req, res) => {
    try {
        const { code } = req.params;

        const result = await pvGroupService.getPVGroupByCode(code);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Voucher Group not found'
            });
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get Voucher Group error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all Voucher Groups
const getAllPVGroups = async (req, res) => {
    try {
        const result = await pvGroupService.getAllPVGroups();

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get all Voucher Groups error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Search Voucher Groups
const searchPVGroups = async (req, res) => {
    try {
        const searchCriteria = req.query;

        const result = await pvGroupService.searchPVGroups(searchCriteria);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Search Voucher Groups error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update Group Status
const updateStatus = async (req, res) => {
    try {
        const { code } = req.params;
        const { status } = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await pvGroupService.updateStatus(code, status, currentUser);

        res.json(result);
    } catch (error) {
        console.error('Update Status error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getNextCode,
    createPVGroup,
    updatePVGroup,
    deletePVGroup,
    getPVGroupByCode,
    getAllPVGroups,
    searchPVGroups,
    updateStatus
};