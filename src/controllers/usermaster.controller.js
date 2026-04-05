const userService = require('../services/user.service');


// Create user
const createUser = async (req, res) => {
    try {
        const userData = req.body;
        const currentUser = req.user.userId;
        
        const result = await userService.createUser(userData, currentUser);
        
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: result
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update user
const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const userData = req.body;
        const currentUser = req.user.userId;
        
        const result = await userService.updateUser(userId, userData, currentUser);
        
        res.json({
            success: true,
            message: 'User updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        
        const user = await userService.getUserById(userId);
        
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Search users
const searchUsers = async (req, res) => {
    try {
        const searchCriteria = req.query;
        
        const result = await userService.searchUsers(searchCriteria);
        
        res.json({
            success: true,
            data: result.users,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const currentUser = req.user.userId;
        
        await userService.deleteUser(userId, currentUser);
        
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Reset password
const resetPassword = async (req, res) => {
    try {
        const userId = req.params.id;
        const { newPassword } = req.body;
        const currentUser = req.user.userId;
        
        await userService.resetPassword(userId, newPassword, currentUser);
        
        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Upload user photo
const uploadUserPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }
        
        const userId = req.params.id;
        const currentUser = req.user.userId;
        
        const fileInfo = await userService.uploadUserPhoto(userId, req.file, currentUser);
        
        res.json({
            success: true,
            message: 'Photo uploaded successfully',
            data: fileInfo
        });
    } catch (error) {
        console.error('Upload photo error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Assign locations
const assignLocations = async (req, res) => {
    try {
        const userId = req.params.id;
        const { locations } = req.body;
        const currentUser = req.user.userId;
        
        if (!Array.isArray(locations) || locations.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one location must be specified'
            });
        }
        
        const result = await userService.assignLocations(userId, locations, currentUser);
        
        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Assign locations error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get user locations
const getUserLocations = async (req, res) => {
    try {
        const userId = req.params.id;
        
        const locations = await userService.getUserLocations(userId);
        
        res.json({
            success: true,
            data: locations
        });
    } catch (error) {
        console.error('Get user locations error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Export users
const exportUsers = async (req, res) => {
    try {
        const searchCriteria = req.query;
        
        const exportData = await userService.exportUsers(searchCriteria);
        
        res.set(exportData.headers);
        res.send(exportData.csv);
    } catch (error) {
        console.error('Export users error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Check duplicates
const checkDuplicates = async (req, res) => {
    try {
        const userData = req.body;
        const excludeUserId = req.query.excludeUserId || null;
        
        const result = await userService.checkDuplicates(userData, excludeUserId);
        
        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Check duplicates error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createUser,
    updateUser,
    getUserById,
    searchUsers,
    deleteUser,
    resetPassword,
    uploadUserPhoto,
    assignLocations,
    getUserLocations,
    exportUsers,
    checkDuplicates
};