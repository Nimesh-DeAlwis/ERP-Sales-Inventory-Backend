const { executeStoredProcedure, sql } = require('../config/database');

class PermissionMiddleware {
    // Check if user has access to a specific menu
    static async checkMenuAccess(req, res, next) {
        try {
            const { userId, userGroup } = req.user;
            const menuTag = req.headers['x-menu-tag'] || req.query.menuTag || req.body.menuTag;
            
            if (!menuTag) {
                return res.status(400).json({
                    success: false,
                    message: 'Menu tag is required'
                });
            }
            
            const result = await executeStoredProcedure('sp_CheckMenuPermission', [
                { name: 'userGroup', value: userGroup, type: sql.NVarChar },
                { name: 'menuTag', value: menuTag, type: sql.NVarChar }
            ]);
            
            if (result.recordset.length === 0 || result.recordset[0].HasAccess === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied to this menu'
                });
            }
            
            // Store permission details for later use
            req.menuPermission = {
                menuTag: menuTag,
                permissions: result.recordset[0].MenuRight || '000000',
                canAccess: result.recordset[0].HasAccess === 1
            };
            
            next();
        } catch (error) {
            console.error('Menu access check error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    
    // Check specific permission (create, modify, delete, etc.)
    static checkPermission(permissionType) {
        return async (req, res, next) => {
            try {
                if (!req.menuPermission) {
                    return res.status(400).json({
                        success: false,
                        message: 'Menu permission not found. Check menu access first.'
                    });
                }
                
                const permissionIndex = {
                    'access': 0,
                    'create': 1,
                    'modify': 2,
                    'delete': 3,
                    'process': 4,
                    'print': 5
                }[permissionType];
                
                if (permissionIndex === undefined) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid permission type'
                    });
                }
                
                const hasPermission = req.menuPermission.permissions.charAt(permissionIndex) === '1';
                
                if (!hasPermission) {
                    return res.status(403).json({
                        success: false,
                        message: `Permission denied: ${permissionType.toUpperCase()}`
                    });
                }
                
                next();
            } catch (error) {
                console.error('Permission check error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
            }
        };
    }
    
    // Get user's all permissions
    static async getUserPermissions(req, res, next) {
        try {
            const { userGroup } = req.user;
            
            const result = await executeStoredProcedure('sp_GetUserGroupPermissions', [
                { name: 'userGroup', value: userGroup, type: sql.NVarChar }
            ]);
            
            req.userPermissions = result.recordset.map(row => ({
                menuTag: row.UGD_MENUTAG,
                menuName: row.MENU_NAME,
                menuRoute: row.MENU_ROUTE,
                parentId: row.MENU_PARENT_ID,
                level: row.MENU_LEVEL,
                order: row.MENU_ORDER,
                permissions: {
                    access: row.UGD_MENURIGHT.charAt(0) === '1',
                    create: row.UGD_MENURIGHT.charAt(1) === '1',
                    modify: row.UGD_MENURIGHT.charAt(2) === '1',
                    delete: row.UGD_MENURIGHT.charAt(3) === '1',
                    process: row.UGD_MENURIGHT.charAt(4) === '1',
                    print: row.UGD_MENURIGHT.charAt(5) === '1'
                },
                menuRight: row.UGD_MENURIGHT
            }));
            
            next();
        } catch (error) {
            console.error('Get user permissions error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    
    // Check if user has any permission for a menu
    static async hasAnyPermission(userGroup, menuTag) {
        try {
            const result = await executeStoredProcedure('sp_CheckMenuPermission', [
                { name: 'userGroup', value: userGroup, type: sql.NVarChar },
                { name: 'menuTag', value: menuTag, type: sql.NVarChar }
            ]);
            
            return result.recordset.length > 0 && result.recordset[0].HasAccess === 1;
        } catch (error) {
            console.error('Has any permission error:', error);
            return false;
        }
    }
    
    // Check specific permission for user
    static async hasPermission(userGroup, menuTag, permissionType) {
        try {
            const result = await executeStoredProcedure('sp_GetMenuPermissionDetails', [
                { name: 'userGroup', value: userGroup, type: sql.NVarChar },
                { name: 'menuTag', value: menuTag, type: sql.NVarChar }
            ]);
            
            if (result.recordset.length === 0) {
                return false;
            }
            
            const menuRight = result.recordset[0].UGD_MENURIGHT || '000000';
            const permissionIndex = {
                'access': 0,
                'create': 1,
                'modify': 2,
                'delete': 3,
                'process': 4,
                'print': 5
            }[permissionType];
            
            return menuRight.charAt(permissionIndex) === '1';
        } catch (error) {
            console.error('Has permission error:', error);
            return false;
        }
    }
}

module.exports = PermissionMiddleware;