const evGroupService = require('../../../services/vouchers/evoucher/evgroup.service');

// Get next voucher group code
const getNextCode = async (req, res) => {
    try {
        const nextCode = await evGroupService.getNextCode();
        
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

// Create E-Voucher Group
const createEVGroup = async (req, res) => {
    try {
        const data = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await evGroupService.createEVGroup(data, currentUser);

        res.status(201).json(result);
    } catch (error) {
        console.error('Create E-Voucher Group error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update E-Voucher Group
const updateEVGroup = async (req, res) => {
    try {
        const { code } = req.params;
        const data = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await evGroupService.updateEVGroup(code, data, currentUser);

        res.json(result);
    } catch (error) {
        console.error('Update E-Voucher Group error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Delete E-Voucher Group
const deleteEVGroup = async (req, res) => {
    try {
        const { code } = req.params;

        const result = await evGroupService.deleteEVGroup(code);

        res.json(result);
    } catch (error) {
        console.error('Delete E-Voucher Group error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get E-Voucher Group by code
const getEVGroupByCode = async (req, res) => {
    try {
        const { code } = req.params;

        const result = await evGroupService.getEVGroupByCode(code);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'E-Voucher Group not found'
            });
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get E-Voucher Group error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all E-Voucher Groups
const getAllEVGroups = async (req, res) => {
    try {
        const result = await evGroupService.getAllEVGroups();

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get all E-Voucher Groups error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Search E-Voucher Groups
const searchEVGroups = async (req, res) => {
    try {
        const searchCriteria = req.query;

        const result = await evGroupService.searchEVGroups(searchCriteria);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Search E-Voucher Groups error:', error);
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

        const result = await evGroupService.updateStatus(code, status, currentUser);

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
    createEVGroup,
    updateEVGroup,
    deleteEVGroup,
    getEVGroupByCode,
    getAllEVGroups,
    searchEVGroups,
    updateStatus
};