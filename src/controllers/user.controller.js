const { executeStoredProcedure, query } = require('../config/database');

const getUserProfile = async (req, res) => {
    try {
        const result = await executeStoredProcedure('sp_GetUserProfile', [
            { name: 'userId', value: req.user.userId }
        ]);
        
        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getUserPermissions = async (req, res) => {
    try {
        const result = await executeStoredProcedure('sp_GetUserPermissions', [
            { name: 'userId', value: req.user.userId },
            { name: 'locationCode', value: req.user.locationCode }
        ]);
        
        res.json(result.recordset);
    } catch (error) {
        console.error('Get user permissions error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const { firstName, lastName, mobile, email, address } = req.body;
        
        await executeStoredProcedure('sp_UpdateUserProfile', [
            { name: 'userId', value: req.user.userId },
            { name: 'firstName', value: firstName },
            { name: 'lastName', value: lastName },
            { name: 'mobile', value: mobile },
            { name: 'email', value: email },
            { name: 'address', value: address },
            { name: 'modifiedBy', value: req.user.userId }
        ]);
        
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update user profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // Verify current password
        const verifyResult = await executeStoredProcedure('sp_VerifyPassword', [
            { name: 'userId', value: req.user.userId },
            { name: 'password', value: currentPassword }
        ]);
        
        if (verifyResult.recordset[0].IsValid === 0) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        
        // Update password
        await executeStoredProcedure('sp_ChangePassword', [
            { name: 'userId', value: req.user.userId },
            { name: 'newPassword', value: newPassword },
            { name: 'modifiedBy', value: req.user.userId }
        ]);
        
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getUserProfile,
    getUserPermissions,
    updateUserProfile,
    changePassword
};