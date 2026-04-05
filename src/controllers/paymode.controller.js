const payModeService = require('../services/paymode.service');

// Get all payment modes (for dropdown)
const getAllPayModes = async (req, res) => {
    try {
        const payModes = await payModeService.getAllPayModes();
        
        res.json({
            success: true,
            data: payModes
        });
    } catch (error) {
        console.error('Get all payment modes error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create payment mode
const createPayMode = async (req, res) => {
    try {
        const { headerData, details } = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await payModeService.createPayMode(headerData, details, currentUser);

        res.status(201).json({
            success: true,
            message: 'Payment mode created successfully',
            data: result
        });
    } catch (error) {
        console.error('Create payment mode error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update payment mode
const updatePayMode = async (req, res) => {
    try {
        const phCode = req.params.id;
        const { headerData, details } = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await payModeService.updatePayMode(phCode, headerData, details, currentUser);

        res.json({
            success: true,
            message: 'Payment mode updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Update payment mode error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get payment mode by code
const getPayModeByCode = async (req, res) => {
    try {
        const phCode = req.params.id;

        const result = await payModeService.getPayModeWithDetails(phCode);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get payment mode error:', error);
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Search payment modes
const searchPayModes = async (req, res) => {
    try {
        const searchCriteria = req.query;

        const result = await payModeService.searchPayModes(searchCriteria);

        res.json({
            success: true,
            data: result.payModes,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Search payment modes error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete payment mode
const deletePayMode = async (req, res) => {
    try {
        const phCode = req.params.id;
        const currentUser = req.user?.userId || 'SYSTEM';

        await payModeService.deletePayMode(phCode, currentUser);

        res.json({
            success: true,
            message: 'Payment mode deleted successfully'
        });
    } catch (error) {
        console.error('Delete payment mode error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Check duplicate payment mode code
const checkDuplicatePayModeCode = async (req, res) => {
    try {
        const { phCode } = req.query;
        const excludePhCode = req.query.excludePhCode || null;

        if (!phCode) {
            return res.status(400).json({
                success: false,
                message: 'Payment mode code is required'
            });
        }

        const exists = await payModeService.checkDuplicatePayModeCode(phCode, excludePhCode);

        res.json({
            success: true,
            exists,
            message: exists ? `Payment mode code '${phCode}' already exists` : 'Payment mode code available'
        });
    } catch (error) {
        console.error('Check duplicate payment mode code error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get payment mode details
const getPayModeDetails = async (req, res) => {
    try {
        const phCode = req.params.id;

        const details = await payModeService.getPayModeDetails(phCode);

        res.json({
            success: true,
            data: details
        });
    } catch (error) {
        console.error('Get payment mode details error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createPayMode,
    updatePayMode,
    getPayModeByCode,
    searchPayModes,
    deletePayMode,
    getAllPayModes,
    checkDuplicatePayModeCode,
    getPayModeDetails
};