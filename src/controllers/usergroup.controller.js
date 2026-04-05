const userGroupService = require('../services/usergroup.service');

// Get all user groups (not just by ID)
const getAllUserGroups = async (req, res) => {
    try {
        const userGroups = await userGroupService.getAllUserGroups();
        
        res.json({
            success: true,
            data: userGroups
        });
    } catch (error) {
        console.error('Get all user groups error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create user group
const createUserGroup = async (req, res) => {
    try {
        const { groupData, details } = req.body;
        const currentUser = req.user.userId;

        const result = await userGroupService.createUserGroup(groupData, details, currentUser);

        res.status(201).json({
            success: true,
            message: 'User group created successfully',
            data: result
        });
    } catch (error) {
        console.error('Create user group error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update user group
const updateUserGroup = async (req, res) => {
    try {
        const groupCode = req.params.id;
        const { groupData, details } = req.body;
        const currentUser = req.user.userId;

        const result = await userGroupService.updateUserGroup(groupCode, groupData, details, currentUser);

        res.json({
            success: true,
            message: 'User group updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Update user group error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get user group by ID
const getUserGroupById = async (req, res) => {
    try {
        const groupCode = req.params.id;
        console.log('Getting user group by ID:', groupCode);

        const result = await userGroupService.getUserGroupWithDetails(groupCode);
        console.log('Service result:', JSON.stringify(result, null, 2));

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get user group error:', error);
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Search user groups
const searchUserGroups = async (req, res) => {
    try {
        const searchCriteria = req.query;

        const result = await userGroupService.searchUserGroups(searchCriteria);

        res.json({
            success: true,
            data: result.groups,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Search user groups error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all menus
const getAllMenus = async (req, res) => {
    try {
        const menus = await userGroupService.getAllMenus();
        
        // Check if service returned success
        if (menus && menus.success === false) {
            return res.status(500).json({
                success: false,
                data: [],
                message: menus.message || 'Error retrieving menus'
            });
        }
        
        // Check if menus has data property
        let menuData = [];
        if (menus && Array.isArray(menus.data)) {
            menuData = menus.data;
        } else if (Array.isArray(menus)) {
            // In case service returns array directly
            menuData = menus;
        }
        
        return res.json({
            success: true,
            data: menuData,
            message: 'All menus retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting all menus:', error);
        return res.status(500).json({
            success: false,
            data: [],
            message: 'Error retrieving menus',
            error: error.message
        });
    }
};

// Delete user group
const deleteUserGroup = async (req, res) => {
    try {
        const groupCode = req.params.id;
        const currentUser = req.user.userId;

        await userGroupService.deleteUserGroup(groupCode, currentUser);

        res.json({
            success: true,
            message: 'User group deleted successfully'
        });
    } catch (error) {
        console.error('Delete user group error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get menus for group assignment
const getMenusForGroup = async (req, res) => {
    try {
        const groupCode = req.query.groupCode || null;

        const menus = await userGroupService.getMenusForGroup(groupCode);

        res.json({
            success: true,
            data: menus
        });
    } catch (error) {
        console.error('Get menus for group error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get user count by group
const getUserCountByGroup = async (req, res) => {
    try {
        const groupCode = req.params.id;

        const count = await userGroupService.getUserCountByGroup(groupCode);

        res.json({
            success: true,
            data: { userCount: count }
        });
    } catch (error) {
        console.error('Get user count by group error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Check duplicate group code
const checkDuplicateGroupCode = async (req, res) => {
    try {
        const { groupCode } = req.query;
        const excludeGroupCode = req.query.excludeGroupCode || null;

        if (!groupCode) {
            return res.status(400).json({
                success: false,
                message: 'Group code is required'
            });
        }

        const exists = await userGroupService.checkDuplicateGroupCode(groupCode, excludeGroupCode);

        res.json({
            success: true,
            exists,
            message: exists ? `Group code '${groupCode}' already exists` : 'Group code available'
        });
    } catch (error) {
        console.error('Check duplicate group code error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Generate menu right string
const generateMenuRight = (req, res) => {
    try {
        const { permissions } = req.body;

        const menuRight = userGroupService.generateMenuRight(permissions);

        res.json({
            success: true,
            data: { menuRight }
        });
    } catch (error) {
        console.error('Generate menu right error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Parse menu right string
const parseMenuRight = (req, res) => {
    try {
        const { menuRight } = req.body;

        const permissions = userGroupService.parseMenuRight(menuRight);

        res.json({
            success: true,
            data: { permissions }
        });
    } catch (error) {
        console.error('Parse menu right error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// Export all functions
module.exports = {
    createUserGroup,
    updateUserGroup,
    getUserGroupById,
    searchUserGroups,
    deleteUserGroup,
    getMenusForGroup,
    getUserCountByGroup,
    checkDuplicateGroupCode,
    generateMenuRight,
    parseMenuRight,
    getAllUserGroups,
    getAllMenus  
};