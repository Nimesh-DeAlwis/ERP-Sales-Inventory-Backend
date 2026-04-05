const { executeStoredProcedure, sql } = require('../config/database');
const { 
    UserGroup, 
    UserGroupDetail, 
    UserGroupWithDetails,
    Menu,
    UserGroupSearchCriteria 
} = require('../models/usergroup.model');



class UserGroupService {
    constructor() {}

    // Get all user groups (for dropdown)
async getAllUserGroups() {
    try {
        const result = await executeStoredProcedure('sp_UserGroup_GetAll', []);
        
        if (result.recordset.length === 0) {
            return [];
        }

        return result.recordset.map(row => new UserGroup(row));
    } catch (error) {
        // If stored procedure doesn't exist, try alternative approach
        console.warn('sp_UserGroup_GetAll not found, trying alternative...');
        
        try {
            // Try to get active groups only
            const searchResult = await this.searchUserGroups({
                page: 1,
                pageSize: 100,
                status: true
            });
            
            return searchResult.groups || [];
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            throw new Error('Unable to fetch user groups');
        }
    }
}

    // Get all menus (for menu management)
    async getAllMenus() {
        try {
            const result = await executeStoredProcedure('sp_Get_All_Menus', []); 
            
            console.log('Stored procedure result:', result); // Debug log
            
            if (!result || !result.recordset) {
                console.warn('No recordset returned from stored procedure');
                return []; // Return empty array instead of success object
            }

            if (result.recordset.length === 0) {
                console.log('No menus found in database');
                return []; // Return empty array
            }

            // Map to Menu objects
            const menus = result.recordset.map(row => {
                try {
                    return new Menu(row);
                } catch (error) {
                    console.error('Error creating Menu object:', error, row);
                    // Return basic object if Menu class fails
                    return {
                        menuTag: row.MenuTag || row.MENU_TAG || '',
                        menuName: row.MenuName || row.MENU_NAME || '',
                        parentMenu: row.ParentMenu || row.PARENT_MENU || ''
                    };
                }
            });

            // Return array directly (not success object)
            return menus;
            
        } catch (error) {
            console.error('Error getting all menus:', error);
            // Throw error to be caught by controller
            throw new Error(`Failed to get menus: ${error.message}`);
        }
    }

    // Create user group
    async createUserGroup(groupData, details, currentUser) {
        try {
            // Check if group code already exists
            const existing = await this.getUserGroupById(groupData.groupCode);
            if (existing) {
                throw new Error(`User group code '${groupData.groupCode}' already exists`);
            }

            // Create user group header
            await executeStoredProcedure('sp_UserGroup_Create', [
                { name: 'groupCode', value: groupData.groupCode, type: sql.NVarChar },
                { name: 'description', value: groupData.description, type: sql.NVarChar },
                { name: 'status', value: groupData.status !== undefined ? groupData.status : true, type: sql.Bit },
                { name: 'createdBy', value: currentUser, type: sql.NVarChar }
            ]);

            // Add details if provided
            if (details && Array.isArray(details) && details.length > 0) {
                await this.addGroupDetails(groupData.groupCode, details, currentUser);
            }

            return await this.getUserGroupWithDetails(groupData.groupCode);
        } catch (error) {
            throw error;
        }
    }

    // Update user group
    async updateUserGroup(groupCode, groupData, details, currentUser) {
        try {
            // Update user group header
            await executeStoredProcedure('sp_UserGroup_Update', [
                { name: 'groupCode', value: groupCode, type: sql.NVarChar },
                { name: 'description', value: groupData.description, type: sql.NVarChar },
                { name: 'status', value: groupData.status !== undefined ? groupData.status : true, type: sql.Bit },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar }
            ]);

            // Update details if provided
            if (details && Array.isArray(details)) {
                // First delete existing details
                await executeStoredProcedure('sp_UserGroupDetail_DeleteByGroup', [
                    { name: 'groupCode', value: groupCode, type: sql.NVarChar }
                ]);

                // Add new details
                if (details.length > 0) {
                    await this.addGroupDetails(groupCode, details, currentUser);
                }
            }

            return await this.getUserGroupWithDetails(groupCode);
        } catch (error) {
            throw error;
        }
    }

    // Get user group by ID
    async getUserGroupById(groupCode) {
        try {
            const result = await executeStoredProcedure('sp_UserGroup_GetById', [
                { name: 'groupCode', value: groupCode, type: sql.NVarChar }
            ]);

            if (result.recordset.length === 0) {
                return null;
            }

            return new UserGroup(result.recordset[0]);
        } catch (error) {
            throw error;
        }
    }

    // Get user group with details
        async getUserGroupWithDetails(groupCode) {
        try {
            const group = await this.getUserGroupById(groupCode);
            if (!group) {
                throw new Error(`User group '${groupCode}' not found`);
            }

            const details = await this.getGroupDetails(groupCode);
            
            // Return in the format that frontend expects
            return {
                success: true,
                data: {
                    groupCode: group.groupCode,
                    description: group.description,
                    status: group.status,
                    permissions: details.data?.permissions || []
                },
                message: 'User group retrieved successfully'
            };
        } catch (error) {
            console.error('Error getting user group with details:', error);
            return {
                success: false,
                message: error.message || 'Error retrieving user group',
                data: null
            };
        }
    }
    // Get group details get to user group master and details
        async getGroupDetails(groupCode) {
        try {
            console.log('Getting user group for code:', groupCode);
            
            const params = [
                { name: 'UG_CODE', value: groupCode, type: sql.NVarChar(5) }
            ];
            
            const result = await executeStoredProcedure('sp_UserGroupDetail_GetByGroup', params);
            
            console.log('Stored procedure result:', {
                recordsets: result.recordsets ? result.recordsets.length : 0,
                firstSet: result.recordsets && result.recordsets[0] ? result.recordsets[0].length : 0,
                secondSet: result.recordsets && result.recordsets[1] ? result.recordsets[1].length : 0
            });
            
            if (!result.recordsets || result.recordsets[0].length === 0) {
                return {
                    success: false,
                    message: 'User group not found',
                    data: null
                };
            }
            
            const group = result.recordsets[0][0];
            
            // Get permissions from second recordset
            let permissions = [];
            if (result.recordsets[1] && result.recordsets[1].length > 0) {
                permissions = result.recordsets[1].map(row => {
                    const menuRight = row.MenuRight || row.UGD_MENURIGHT || '';
                    return {
                        menuTag: row.MenuTag || row.UGD_MENUTAG || '',
                        menuName: row.MenuName || '',
                        menuRight: menuRight,
                        rights: {
                            ACCESS: menuRight?.charAt(0) === '1' || false,
                            CREATE: menuRight?.charAt(1) === '1' || false,
                            MODIFY: menuRight?.charAt(2) === '1' || false,
                            DELETE: menuRight?.charAt(3) === '1' || false,
                            PROCESS: menuRight?.charAt(4) === '1' || false,
                            PRINT: menuRight?.charAt(5) === '1' || false
                        }
                    };
                });
            }
            
            console.log('Permissions found:', permissions.length);
            
            return {
                success: true,
                data: {
                    groupCode: group.GroupCode || group.UG_CODE,
                    description: group.Description || group.UG_DESC,
                    status: group.Status || group.UG_STATUS,
                    permissions: permissions
                },
                message: 'User group retrieved successfully'
            };
        } catch (error) {
            console.error('Error getting user group:', error);
            return {
                success: false,
                message: 'Error retrieving user group: ' + error.message,
                data: null
            };
        }
    }

    // Add group details
    async addGroupDetails(groupCode, details, currentUser) {
        try {
            for (const detail of details) {
                await executeStoredProcedure('sp_UserGroupDetail_Create', [
                    { name: 'groupCode', value: groupCode, type: sql.NVarChar },
                    { name: 'menuTag', value: detail.menuTag, type: sql.NVarChar },
                    { name: 'menuRight', value: detail.menuRight || '000000', type: sql.NVarChar },
                    { name: 'createdBy', value: currentUser, type: sql.NVarChar }
                ]);
            }
            return { message: 'Details added successfully' };
        } catch (error) {
            throw error;
        }
    }

    // Search user groups with pagination
    async searchUserGroups(criteria) {
        try {
            const searchCriteria = new UserGroupSearchCriteria(criteria);
            
            let statusValue = null;
            if (searchCriteria.status !== null) {
                statusValue = searchCriteria.status === true || 
                             searchCriteria.status === 'true' || 
                             searchCriteria.status === 1 || 
                             searchCriteria.status === '1';
            }

            const result = await executeStoredProcedure('sp_UserGroup_Search', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar },
                { name: 'status', value: statusValue, type: sql.Bit },
                { name: 'page', value: searchCriteria.page, type: sql.Int },
                { name: 'pageSize', value: searchCriteria.pageSize, type: sql.Int },
                { name: 'sortBy', value: searchCriteria.sortBy, type: sql.NVarChar },
                { name: 'sortOrder', value: searchCriteria.sortOrder, type: sql.NVarChar }
            ]);

            const groups = result.recordset.map(row => new UserGroup(row));

            // Get total count
            const countResult = await executeStoredProcedure('sp_UserGroup_Count', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar },
                { name: 'status', value: statusValue, type: sql.Bit }
            ]);

            const total = countResult.recordset[0] ? countResult.recordset[0].TotalCount : 0;

            return {
                groups,
                pagination: {
                    page: searchCriteria.page,
                    pageSize: searchCriteria.pageSize,
                    total,
                    totalPages: Math.ceil(total / searchCriteria.pageSize)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    // Delete user group
    async deleteUserGroup(groupCode, currentUser) {
        try {
            // Check if group is being used by any users
            const userCount = await this.getUserCountByGroup(groupCode);
            if (userCount > 0) {
                throw new Error(`Cannot delete group '${groupCode}' as it is assigned to ${userCount} user(s)`);
            }

            // First delete details
            await executeStoredProcedure('sp_UserGroupDetail_DeleteByGroup', [
                { name: 'groupCode', value: groupCode, type: sql.NVarChar }
            ]);

            // Then delete group
            const result = await executeStoredProcedure('sp_UserGroup_Delete', [
                { name: 'groupCode', value: groupCode, type: sql.NVarChar },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar }
            ]);

            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    // Get menus for user group assignment
        async getMenusForGroup(groupCode = null) {
        try {
            const params = [];
            if (groupCode) {
                params.push({ name: 'groupCode', value: groupCode, type: sql.NVarChar });
            }
            
            const result = await executeStoredProcedure('sp_Get_All_Menus', params);

            if (!result || !result.recordset) {
                return [];
            }

            return result.recordset.map(row => {
                try {
                    return new Menu(row);
                } catch (error) {
                    return {
                        menuTag: row.MenuTag || row.MENU_TAG || '',
                        menuName: row.MenuName || row.MENU_NAME || '',
                        parentMenu: row.ParentMenu || row.PARENT_MENU || ''
                    };
                }
            });
        } catch (error) {
            console.error('Error getting menus for group:', error);
            throw error;
        }
    }

    // Get user count by group
    async getUserCountByGroup(groupCode) {
        try {
            const result = await executeStoredProcedure('sp_UserGroup_GetUserCount', [
                { name: 'groupCode', value: groupCode, type: sql.NVarChar }
            ]);

            return result.recordset[0] ? result.recordset[0].UserCount : 0;
        } catch (error) {
            throw error;
        }
    }

    // Check duplicate group code
    async checkDuplicateGroupCode(groupCode, excludeGroupCode = null) {
    try {
        const result = await executeStoredProcedure('sp_UserGroup_CheckDuplicate', [
            { name: 'groupCode', value: groupCode, type: sql.NVarChar },
            { name: 'excludeGroupCode', value: excludeGroupCode, type: sql.NVarChar }
        ]);
        
        return result.recordset[0].IsDuplicate === 1;
    } catch (error) {
        throw error;
    }
}

    // Generate menu right string from permissions object
    static generateMenuRight(permissions) {
        if (typeof permissions === 'string') {
            // If it's already a string, validate and return
            if (permissions.length === 6 && /^[01]+$/.test(permissions)) {
                return permissions;
            }
            return '000000';
        }

        // Convert permissions object to binary string
        const access = permissions.access ? '1' : '0';
        const create = permissions.create ? '1' : '0';
        const modify = permissions.modify ? '1' : '0';
        const del = permissions.delete ? '1' : '0';
        const process = permissions.process ? '1' : '0';
        const print = permissions.print ? '1' : '0';

        return access + create + modify + del + process + print;
    }

    // Parse menu right string to permissions object
        static parseMenuRight(menuRight) {
        if (!menuRight || menuRight.length !== 6) {
            return {
                access: false,
                create: false,
                modify: false,
                delete: false,
                process: false,
                print: false
            };
        }

        return {
            access: menuRight.charAt(0) === '1',
            create: menuRight.charAt(1) === '1',
            modify: menuRight.charAt(2) === '1',
            delete: menuRight.charAt(3) === '1',
            process: menuRight.charAt(4) === '1',
            print: menuRight.charAt(5) === '1'
        };
    }
}

module.exports = new UserGroupService();