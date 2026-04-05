const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

const checkUserStatus = async (req, res, next) => {
    try {
        const { executeStoredProcedure } = require('../config/database');
        const result = await executeStoredProcedure('sp_CheckUserStatus', [
            { name: 'userId', value: req.user.userId }
        ]);
        
        if (result.recordset[0].IsActive === 0) {
            return res.status(403).json({ message: 'User account is inactive' });
        }
        next();
    } catch (error) {
        console.error('Error checking user status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const checkLocationPermission = async (req, res, next) => {
    try {
        const { locationCode } = req.body;
        const { executeStoredProcedure } = require('../config/database');
        
        const result = await executeStoredProcedure('sp_CheckLocationPermission', [
            { name: 'userId', value: req.user.userId },
            { name: 'locationCode', value: locationCode }
        ]);
        
        if (result.recordset[0].HasAccess === 0) {
            return res.status(403).json({ message: 'No permission for this location' });
        }
        next();
    } catch (error) {
        console.error('Error checking location permission:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    authenticateToken,
    checkUserStatus,
    checkLocationPermission
};