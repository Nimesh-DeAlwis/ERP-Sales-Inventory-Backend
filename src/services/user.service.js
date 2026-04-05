const { executeStoredProcedure, query, sql } = require('../config/database');
const { UserMaster, UserLocationMaster, UserSearchCriteria } = require('../models/usermaster.model');
const fileUploadUtil = require('../utils/fileUpload.util');
const exportUtil = require('../utils/export.util');
const TypeHelper = require('../utils/type.helper');
const bcrypt = require('bcryptjs');

class UserService {
    constructor() {
        // Initialize if needed
    }

    // Get user by ID
    async getUserById(userId) {
        try {
            const result = await executeStoredProcedure('sp_UserMaster_GetById', [
                { name: 'userId', value: userId, type: sql.NVarChar }
            ]);
            
            if (result.recordset.length === 0) {
                throw new Error('User not found');
            }
            
            return new UserMaster(result.recordset[0]);
        } catch (error) {
            throw error;
        }
    }

    // Search users with pagination
    async searchUsers(criteria) {
        try {
            const searchCriteria = new UserSearchCriteria(criteria);
            
            // Convert status to proper type
            let statusValue = null;
            if (searchCriteria.status !== null) {
                statusValue = searchCriteria.status === true || 
                             searchCriteria.status === 'true' || 
                             searchCriteria.status === 1 || 
                             searchCriteria.status === '1';
            }
            
            const result = await executeStoredProcedure('sp_UserMaster_Search', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar },
                { name: 'userGroup', value: searchCriteria.userGroup, type: sql.NVarChar },
                { name: 'status', value: statusValue, type: sql.Bit },
                { name: 'designation', value: searchCriteria.designation, type: sql.NVarChar },
                { name: 'locationCode', value: searchCriteria.locationCode, type: sql.NVarChar },
                { name: 'page', value: searchCriteria.page, type: sql.Int },
                { name: 'pageSize', value: searchCriteria.pageSize, type: sql.Int },
                { name: 'sortBy', value: searchCriteria.sortBy, type: sql.NVarChar },
                { name: 'sortOrder', value: searchCriteria.sortOrder, type: sql.NVarChar }
            ]);
            
            const users = result.recordset.map(row => new UserMaster(row));
            
            // Get total count
            const countResult = await executeStoredProcedure('sp_UserMaster_Count', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar },
                { name: 'userGroup', value: searchCriteria.userGroup, type: sql.NVarChar },
                { name: 'status', value: statusValue, type: sql.Bit },
                { name: 'designation', value: searchCriteria.designation, type: sql.NVarChar },
                { name: 'locationCode', value: searchCriteria.locationCode, type: sql.NVarChar }
            ]);
            
            const total = countResult.recordset[0] ? countResult.recordset[0].TotalCount : 0;
            
            return {
                users,
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

    // Create new user
    async createUser(userData, currentUser) {
        try {
            // Check for duplicates
            const duplicateCheck = await this.checkDuplicates(userData);
            if (duplicateCheck.exists) {
                throw new Error(duplicateCheck.message);
            }
            
            // Auto-generate DOB from NIC if not provided
            if (userData.nic && !userData.dob) {
                const dob = UserMaster.calculateDOBFromNIC(userData.nic);
                if (dob) userData.dob = dob;
            }
            
            // Auto-determine gender from NIC if not provided
            if (userData.nic && !userData.gender) {
                userData.gender = UserMaster.getGenderFromNIC(userData.nic);
            }
            
            // Validate phone number
            if (userData.mobile && !UserMaster.validatePhoneNumber(userData.mobile)) {
                throw new Error('Invalid phone number format');
            }
            
            // Format phone number
            if (userData.mobile) {
                userData.mobile = UserMaster.formatPhoneNumber(userData.mobile);
            }
            
            // Hash password
            let hashedPassword = null;
            let resetPasswordFlag = 0;
            
            if (userData.password) {
                hashedPassword = await bcrypt.hash(userData.password, 10);
                resetPasswordFlag = 0;
            } else {
                // Set default password
                const defaultPassword = 'Mora@123';
                hashedPassword = await bcrypt.hash(defaultPassword, 10);
                resetPasswordFlag = 1;
            }
            
            // Generate user ID if not provided
            if (!userData.userId) {
                userData.userId = await this.generateUserId(userData.userGroup);
            }
            
            // Create user
            const result = await executeStoredProcedure('sp_UserMaster_Create', [
                { name: 'userId', value: userData.userId, type: sql.NVarChar },
                { name: 'firstName', value: userData.firstName, type: sql.NVarChar },
                { name: 'lastName', value: userData.lastName || '', type: sql.NVarChar },
                { name: 'fullName', value: userData.fullName || '', type: sql.NVarChar },
                { name: 'password', value: hashedPassword, type: sql.NVarChar },
                { name: 'userGroup', value: userData.userGroup, type: sql.NVarChar },
                { name: 'nic', value: userData.nic, type: sql.NVarChar },
                { name: 'status', value: userData.status !== undefined ? userData.status : 1, type: sql.Bit },
                { name: 'photo', value: userData.photo || null, type: sql.NVarChar },
                { name: 'gender', value: userData.gender || '', type: sql.NVarChar },
                { name: 'dob', value: userData.dob, type: sql.Date },
                { name: 'designation', value: userData.designation || '', type: sql.NVarChar },
                { name: 'address', value: userData.address, type: sql.NVarChar },
                { name: 'mobile', value: userData.mobile || '', type: sql.NVarChar },
                { name: 'email', value: userData.email || '', type: sql.NVarChar },
                { name: 'isAppUser', value: userData.isAppUser || 0, type: sql.Int },
                { name: 'createdBy', value: currentUser, type: sql.NVarChar }
            ]);
            
            return result.recordset[0];
            
        } catch (error) {
            throw error;
        }
    }

    // Update user
    async updateUser(userId, userData, currentUser) {
        try {
            // Check for duplicates excluding current user
            if (userData.nic || userData.mobile || userData.email) {
                const duplicateCheck = await this.checkDuplicates(userData, userId);
                if (duplicateCheck.exists) {
                    throw new Error(duplicateCheck.message);
                }
            }
            
            // Auto-update DOB from NIC if NIC changed
            if (userData.nic && !userData.dob) {
                const dob = UserMaster.calculateDOBFromNIC(userData.nic);
                if (dob) userData.dob = dob;
            }
            
            // Auto-update gender from NIC if NIC changed
            if (userData.nic && !userData.gender) {
                userData.gender = UserMaster.getGenderFromNIC(userData.nic);
            }
            
            // Validate phone number
            if (userData.mobile && !UserMaster.validatePhoneNumber(userData.mobile)) {
                throw new Error('Invalid phone number format');
            }
            
            // Format phone number
            if (userData.mobile) {
                userData.mobile = UserMaster.formatPhoneNumber(userData.mobile);
            }
            
            // Update user
            const result = await executeStoredProcedure('sp_UserMaster_Update', [
                { name: 'userId', value: userId, type: sql.NVarChar },
                { name: 'firstName', value: userData.firstName, type: sql.NVarChar },
                { name: 'lastName', value: userData.lastName || '', type: sql.NVarChar },
                { name: 'fullName', value: userData.fullName || '', type: sql.NVarChar },
                { name: 'userGroup', value: userData.userGroup, type: sql.NVarChar },
                { name: 'nic', value: userData.nic, type: sql.NVarChar },
                { name: 'status', value: userData.status !== undefined ? userData.status : true, type: sql.Bit },
                { name: 'photo', value: userData.photo || null, type: sql.NVarChar },
                { name: 'gender', value: userData.gender || '', type: sql.NVarChar },
                { name: 'dob', value: userData.dob, type: sql.Date },
                { name: 'designation', value: userData.designation || '', type: sql.NVarChar },
                { name: 'address', value: userData.address, type: sql.NVarChar },
                { name: 'mobile', value: userData.mobile || '', type: sql.NVarChar },
                { name: 'email', value: userData.email || '', type: sql.NVarChar },
                { name: 'isAppUser', value: userData.isAppUser || 0, type: sql.Int },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar }
            ]);
            
            return result.recordset[0];
            
        } catch (error) {
            throw error;
        }
    }

    // Delete user (soft delete - change status to inactive)
    async deleteUser(userId, currentUser) {
        try {
            const result = await executeStoredProcedure('sp_UserMaster_Delete', [
                { name: 'userId', value: userId, type: sql.NVarChar },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar }
            ]);
            
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    // Reset password
    async resetPassword(userId, newPassword, currentUser) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            const result = await executeStoredProcedure('sp_UserMaster_ResetPassword', [
                { name: 'userId', value: userId, type: sql.NVarChar },
                { name: 'newPassword', value: hashedPassword, type: sql.NVarChar },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar }
            ]);
            
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    // Upload user photo
    async uploadUserPhoto(userId, file, currentUser) {
        try {
            // Validate file
            const validationErrors = fileUploadUtil.validateFile(file);
            if (validationErrors.length > 0) {
                throw new Error(validationErrors.join(', '));
            }
            
            // Generate unique filename
            const fileName = fileUploadUtil.generateFileName(file.originalname);
            
            // Save file
            const fileInfo = await fileUploadUtil.saveFile(file.buffer, fileName);
            
            // Update user record with photo path
            await executeStoredProcedure('sp_UserMaster_UpdatePhoto', [
                { name: 'userId', value: userId, type: sql.NVarChar },
                { name: 'photoPath', value: fileInfo.relativePath, type: sql.NVarChar },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar }
            ]);
            
            return fileInfo;
        } catch (error) {
            throw error;
        }
    }

    // Assign locations to user
    async assignLocations(userId, locations, currentUser) {
        try {
            // First, remove existing locations
            await executeStoredProcedure('sp_UserLocation_DeleteByUser', [
                { name: 'userId', value: userId, type: sql.NVarChar }
            ]);
            
            // Add new locations
            for (const location of locations) {
                await executeStoredProcedure('sp_UserLocation_Create', [
                    { name: 'userId', value: userId, type: sql.NVarChar },
                    { name: 'locationCode', value: location.locationCode, type: sql.NVarChar },
                    { name: 'dateFrom', value: location.dateFrom || new Date(), type: sql.Date },
                    { name: 'dateTo', value: location.dateTo || new Date(new Date().setFullYear(new Date().getFullYear() + 1)), type: sql.Date },
                    { name: 'isActive', value: location.isActive !== undefined ? location.isActive : 1, type: sql.Bit },
                    { name: 'createdBy', value: currentUser, type: sql.NVarChar }
                ]);
            }
            
            return { message: 'Locations assigned successfully' };
        } catch (error) {
            throw error;
        }
    }

    // Get user locations
    async getUserLocations(userId) {
        try {
            const result = await executeStoredProcedure('sp_UserLocation_GetByUser', [
                { name: 'userId', value: userId, type: sql.NVarChar }
            ]);
            
            return result.recordset.map(row => new UserLocationMaster(row));
        } catch (error) {
            throw error;
        }
    }

    // Export users to CSV
    async exportUsers(criteria) {
        try {
            const { users } = await this.searchUsers({ ...criteria, pageSize: 1000 });
            
            const exportData = users.map(user => ({
                userId: user.userId,
                fullName: user.fullName,
                nic: user.nic,
                gender: user.gender === 'M' ? 'Male' : 'Female',
                dob: user.dob ? new Date(user.dob).toLocaleDateString() : '',
                mobile: user.mobile,
                email: user.email,
                userGroup: user.userGroup,
                designation: user.designation,
                address: user.address,
                status: user.status ? 'Active' : 'Inactive',
                createdDate: new Date(user.createdDate).toLocaleString(),
                createdBy: user.createdBy
            }));
            
            return exportUtil.exportToCSV(exportData, exportUtil.getUserExportFields(), 'users');
        } catch (error) {
            throw error;
        }
    }

    // Check for duplicate records
    async checkDuplicates(userData, excludeUserId = null) {
        try {
            const result = await executeStoredProcedure('sp_UserMaster_CheckDuplicates', [
                { name: 'nic', value: userData.nic || null, type: sql.NVarChar },
                { name: 'mobile', value: userData.mobile || null, type: sql.NVarChar },
                { name: 'email', value: userData.email || null, type: sql.NVarChar },
                { name: 'excludeUserId', value: excludeUserId, type: sql.NVarChar }
            ]);
            
            const duplicates = result.recordset[0];
            
            if (duplicates.NICExists && duplicates.NICUserId) {
                return {
                    exists: true,
                    message: `NIC already registered for user: ${duplicates.NICUserId}`
                };
            }
            
            if (duplicates.MobileExists && duplicates.MobileUserId) {
                return {
                    exists: true,
                    message: `Mobile number already registered for user: ${duplicates.MobileUserId}`
                };
            }
            
            if (duplicates.EmailExists && duplicates.EmailUserId) {
                return {
                    exists: true,
                    message: `Email already registered for user: ${duplicates.EmailUserId}`
                };
            }
            
            return { exists: false };
        } catch (error) {
            throw error;
        }
    }

    // Generate user ID
    async generateUserId(userGroup) {
        try {
            const result = await executeStoredProcedure('sp_UserMaster_GenerateId', [
                { name: 'userGroup', value: userGroup, type: sql.NVarChar }
            ]);
            
            return result.recordset[0].NewUserId;
        } catch (error) {
            throw error;
        }
    }
}

// Export an instance of the class
module.exports = new UserService();