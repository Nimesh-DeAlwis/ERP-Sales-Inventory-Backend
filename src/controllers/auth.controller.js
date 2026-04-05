const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { executeStoredProcedure, sql } = require('../config/database');

// Make sure this function exists and is exported
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        console.log('Login attempt for user:', username);
        
        // Step 1: Validate user credentials and get basic info
        const userResult = await executeStoredProcedure('usp_ValidateUserLogin', [
            { name: 'username', value: username, type: sql.NVarChar }
        ]);
        
        if (userResult.recordset.length === 0) {
            console.log('User not found:', username);
            return res.status(401).json({ 
                success: false,
                message: 'Invalid username or password' 
            });
        }
        
        const user = userResult.recordset[0];
        
        // Step 2: Check if user is active
        if (user.UH_STATUS === 0) {
            console.log('User inactive:', username);
            return res.status(403).json({ 
                success: false,
                message: 'This user is inactive. Please contact administrator.' 
            });
        }
        
        // Step 3: Verify password
        const isValidPassword = await bcrypt.compare(password, user.UH_PASSWORD);
        if (!isValidPassword) {
            console.log('Invalid password for user:', username);
            
            // Increment login attempts
            await executeStoredProcedure('usp_IncrementLoginAttempts', [
                { name: 'userId', value: username, type: sql.NVarChar }
            ]);
            
            return res.status(401).json({ 
                success: false,
                message: 'Invalid username or password' 
            });
        }
        
        // Step 4: Reset login attempts on successful login
        await executeStoredProcedure('usp_ResetLoginAttempts', [
            { name: 'userId', value: username, type: sql.NVarChar }
        ]);
        
        console.log('Login successful for user:', username);
        
        // Return user info WITHOUT locations - user will fetch locations on demand
        res.json({
            success: true,
            message: 'Login successful. Click "Load Locations" to proceed.',
            data: {
                userId: user.UH_ID,
                userName: user.UH_FULLNAME,
                userGroup: user.UH_GROUP
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

// Get user locations (called when user clicks "Load Locations" button)
const getLocations = async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ 
                success: false,
                message: 'User ID is required' 
            });
        }
        
        console.log('Fetching locations for user:', userId);
        
        // Get user locations
        const locationsResult = await executeStoredProcedure('usp_GetUserLocations', [
            { name: 'userId', value: userId, type: sql.NVarChar }
        ]);
        
        const locations = locationsResult.recordset;
        
        if (locations.length === 0) {
            console.log('No locations assigned for user:', userId);
            return res.status(403).json({ 
                success: false,
                message: 'No locations assigned to this user. Please contact administrator.' 
            });
        }
        
        console.log('Locations fetched for user:', userId, 'Count:', locations.length);
        
        // Log first location to see what fields are returned
        if (locations.length > 0) {
            console.log('Sample location data:', JSON.stringify(locations[0]));
            console.log('All fields in first location:', Object.keys(locations[0]));
        }
        
        // Normalize location field names for frontend
        const normalizedLocations = locations.map(loc => {
            // Try to get the description from various possible field names
            const code = loc.LOCATION_CODE || loc.LOC_CODE || loc.LocationCode || '';
            const desc = loc.LocationName || loc.LOCATION_DESC || loc.LOC_DESC || loc.LocationDesc || '';
            
            const normalized = {
                value: code,  // Use as the select value
                label: desc || code,  // Display the LocationName, fallback to code
                LocationCode: code,
                LocationDesc: desc,
                LocationName: desc,
                ...loc
            };
            
            console.log('Normalized location:', { code, desc, normalized });
            
            return normalized;
        });
        
        console.log('Final locations to send:', JSON.stringify(normalizedLocations));
        
        res.json({
            success: true,
            message: 'Locations loaded successfully.',
            data: {
                locations: normalizedLocations,
                requiresLocationSelection: normalizedLocations.length > 1
            }
        });
        
    } catch (error) {
        console.error('Get locations error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

// Verify location and login
const verifyLocation = async (req, res) => {
    try {
        const { userId, locationCode, userGroup, userName } = req.body;
        
        console.log('Location verification for user:', userId, 'Location:', locationCode);
        
        // Step 1: Check location permission
        const permissionResult = await executeStoredProcedure('usp_CheckLocationPermission', [
            { name: 'userId', value: userId, type: sql.NVarChar },
            { name: 'locationCode', value: locationCode, type: sql.NVarChar }
        ]);
        
        if (permissionResult.recordset[0].HasAccess === 0) {
            console.log('No location permission:', userId, locationCode);
            return res.status(403).json({ 
                success: false,
                message: 'No permission for this location' 
            });
        }
        
        const locationName = permissionResult.recordset[0].LocationName;
        
        // Step 2: Get user menus with permissions based on user group
        const menusResult = await executeStoredProcedure('usp_GetUserMenusWithPermissions', [
            { name: 'userId', value: userId, type: sql.NVarChar },
            { name: 'locationCode', value: locationCode, type: sql.NVarChar }
        ]);
        
        const menus = menusResult.recordset;
        
        // Step 3: Organize menus hierarchically
        const organizedMenus = organizeMenusHierarchically(menus);
        
        // Step 4: Generate JWT token
        const token = jwt.sign(
            { 
                userId: userId,
                locationCode: locationCode,
                userGroup: userGroup,
                locationName: locationName
            },
            process.env.JWT_SECRET,
            { expiresIn: '6h' }
        );
        
        // Step 5: Store session with menus
        req.session.user = {
            userId: userId,
            locationCode: locationCode,
            locationName: locationName,
            userGroup: userGroup,
            isAuthenticated: true,
            menus: organizedMenus, // Store menus in session
            permissions: extractPermissions(menus)
        };
        
        console.log('Location verified successfully for user:', userId);
        
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token: token,
                user: {
                    userId: userId,
                    userName: userName,
                    userGroup: userGroup,
                    locationCode: locationCode,
                    locationName: locationName
                },
                menus: organizedMenus,
                permissions: extractPermissions(menus)
            }
        });
        
    } catch (error) {
        console.error('Location verification error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

// Helper function to organize menus hierarchically
const organizeMenusHierarchically = (menus) => {
    console.log('Organizing menus hierarchically. Total menus:', menus.length);
    
    // Log sample menu to see structure
    if (menus.length > 0) {
        console.log('Sample menu structure:', {
            MENU_TAG: menus[0].MENU_TAG,
            MENU_NAME: menus[0].MENU_NAME,
            MENU_PARENT_ID: menus[0].MENU_PARENT_ID,
            MENU_LEVEL: menus[0].MENU_LEVEL,
            MenuRight: menus[0].MenuRight
        });
    }
    
    // Group menus by parent ID for easier lookup
    const menusByParent = {};
    const allMenuIds = new Set();
    
    // First pass: Collect all menus
    menus.forEach(menu => {
        const menuObj = {
            menuTag: menu.MENU_TAG,
            menuName: menu.MENU_NAME,
            menuRoute: menu.MENU_ROUTE,
            menuRight: menu.MenuRight || '000000',
            parentId: menu.MENU_PARENT_ID,
            level: menu.MENU_LEVEL,
            order: menu.MENU_ORDER,
            isActive: menu.IS_ACTIVE,
            hasChildren: menu.HasChildren || false,
            children: [],
            permissions: {
                access: menu.MenuRight ? menu.MenuRight.charAt(0) === '1' : false,
                create: menu.MenuRight ? menu.MenuRight.charAt(1) === '1' : false,
                modify: menu.MenuRight ? menu.MenuRight.charAt(2) === '1' : false,
                delete: menu.MenuRight ? menu.MenuRight.charAt(3) === '1' : false,
                process: menu.MenuRight ? menu.MenuRight.charAt(4) === '1' : false,
                print: menu.MenuRight ? menu.MenuRight.charAt(5) === '1' : false
            }
        };
        
        allMenuIds.add(menu.MENU_TAG);
        
        // Initialize parent group if not exists
        if (!menusByParent[menu.MENU_PARENT_ID]) {
            menusByParent[menu.MENU_PARENT_ID] = [];
        }
        
        // Add menu to its parent group
        menusByParent[menu.MENU_PARENT_ID].push(menuObj);
    });
    
    console.log('Menus grouped by parent:', Object.keys(menusByParent).length, 'parent groups');
    
    // Function to build tree recursively
    const buildTree = (parentId) => {
        const children = menusByParent[parentId] || [];
        
        // Sort children by order
        children.sort((a, b) => a.order - b.order);
        
        // For each child, recursively build its subtree
        children.forEach(child => {
            if (child.hasChildren) {
                child.children = buildTree(child.menuTag);
            }
        });
        
        return children;
    };
    
    // Build tree starting from root (null or empty parent IDs)
    const rootParentIds = Object.keys(menusByParent).filter(id => 
        !id || id === '' || !allMenuIds.has(id)
    );
    
    console.log('Root parent IDs found:', rootParentIds);
    
    // Collect all root menus
    const rootMenus = [];
    rootParentIds.forEach(parentId => {
        const menusForParent = buildTree(parentId);
        rootMenus.push(...menusForParent);
    });
    
    // Sort root menus by order
    rootMenus.sort((a, b) => a.order - b.order);
    
    console.log('Final organized menus - Root count:', rootMenus.length);
    
    // Log the structure
    rootMenus.forEach((menu, index) => {
        console.log(`Root Menu ${index + 1}:`, {
            menuTag: menu.menuTag,
            menuName: menu.menuName,
            childrenCount: menu.children.length,
            children: menu.children.map(c => ({ tag: c.menuTag, name: c.menuName }))
        });
    });
    
    return rootMenus;
};

// Helper function to extract permissions from menus
const extractPermissions = (menus) => {
    const permissions = {};
    
    menus.forEach(menu => {
        const menuRight = menu.MenuRight || '000000';
        
        permissions[menu.MENU_TAG] = {
            access: menuRight.charAt(0) === '1',
            create: menuRight.charAt(1) === '1',
            modify: menuRight.charAt(2) === '1',
            delete: menuRight.charAt(3) === '1',
            process: menuRight.charAt(4) === '1',
            print: menuRight.charAt(5) === '1'
        };
    });
    
    return permissions;
};

const logout = (req, res) => {
    req.session.destroy();
    res.json({ 
        success: true,
        message: 'Logged out successfully' 
    });
};

const checkSession = (req, res) => {
    if (req.session.user && req.session.user.isAuthenticated) {
        res.json({ 
            success: true,
            isAuthenticated: true, 
            user: req.session.user 
        });
    } else {
        res.json({ 
            success: true,
            isAuthenticated: false 
        });
    }
};

// Export all functions
module.exports = {
    login,
    getLocations,
    verifyLocation,
    logout,
    checkSession,
    extractPermissions
};