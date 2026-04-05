const { executeStoredProcedure, sql } = require('../config/database');
const { Location, LocationSearchCriteria } = require('../models/location.model');

class LocationService {
    constructor() {}

    // Create new location
    async createLocation(locationData, currentUser) {
        try {
            // Check if location code already exists
            const existing = await this.getLocationById(locationData.locationCode);
            if (existing) {
                throw new Error(`Location code '${locationData.locationCode}' already exists`);
            }

            // Validate phone numbers
            if (locationData.phone1 && !this.validatePhoneNumber(locationData.phone1)) {
                throw new Error('Invalid Phone 1 format');
            }
            if (locationData.phone2 && !this.validatePhoneNumber(locationData.phone2)) {
                throw new Error('Invalid Phone 2 format');
            }
            if (locationData.mobile1 && !this.validatePhoneNumber(locationData.mobile1)) {
                throw new Error('Invalid Mobile 1 format');
            }
            if (locationData.mobile2 && !this.validatePhoneNumber(locationData.mobile2)) {
                throw new Error('Invalid Mobile 2 format');
            }

            // Validate email
            if (locationData.email && !this.validateEmail(locationData.email)) {
                throw new Error('Invalid email format');
            }

            // Create location
            const result = await executeStoredProcedure('sp_Location_Create', [
                { name: 'locationCode', value: locationData.locationCode, type: sql.NVarChar },
                { name: 'description', value: locationData.description, type: sql.NVarChar },
                { name: 'isActive', value: locationData.isActive !== undefined ? locationData.isActive : true, type: sql.Bit },
                { name: 'mainLocation', value: locationData.mainLocation || null, type: sql.NVarChar },
                { name: 'phone1', value: locationData.phone1 || null, type: sql.NVarChar },
                { name: 'phone2', value: locationData.phone2 || null, type: sql.NVarChar },
                { name: 'mobile1', value: locationData.mobile1 || null, type: sql.NVarChar },
                { name: 'mobile2', value: locationData.mobile2 || null, type: sql.NVarChar },
                { name: 'email', value: locationData.email || null, type: sql.NVarChar },
                { name: 'address1', value: locationData.address1 || null, type: sql.NVarChar },
                { name: 'address2', value: locationData.address2 || null, type: sql.NVarChar },
                { name: 'address3', value: locationData.address3 || null, type: sql.NVarChar },
                { name: 'createdBy', value: currentUser, type: sql.NVarChar }
            ]);

            return new Location(result.recordset[0]);
        } catch (error) {
            throw error;
        }
    }

    // Update location
    async updateLocation(locationCode, locationData, currentUser) {
        try {
            // Validate phone numbers
            if (locationData.phone1 && !this.validatePhoneNumber(locationData.phone1)) {
                throw new Error('Invalid Phone 1 format');
            }
            if (locationData.phone2 && !this.validatePhoneNumber(locationData.phone2)) {
                throw new Error('Invalid Phone 2 format');
            }
            if (locationData.mobile1 && !this.validatePhoneNumber(locationData.mobile1)) {
                throw new Error('Invalid Mobile 1 format');
            }
            if (locationData.mobile2 && !this.validatePhoneNumber(locationData.mobile2)) {
                throw new Error('Invalid Mobile 2 format');
            }

            // Validate email
            if (locationData.email && !this.validateEmail(locationData.email)) {
                throw new Error('Invalid email format');
            }

            // Update location
            const result = await executeStoredProcedure('sp_Location_Update', [
                { name: 'locationCode', value: locationCode, type: sql.NVarChar },
                { name: 'description', value: locationData.description, type: sql.NVarChar },
                { name: 'isActive', value: locationData.isActive !== undefined ? locationData.isActive : true, type: sql.Bit },
                { name: 'mainLocation', value: locationData.mainLocation || null, type: sql.NVarChar },
                { name: 'phone1', value: locationData.phone1 || null, type: sql.NVarChar },
                { name: 'phone2', value: locationData.phone2 || null, type: sql.NVarChar },
                { name: 'mobile1', value: locationData.mobile1 || null, type: sql.NVarChar },
                { name: 'mobile2', value: locationData.mobile2 || null, type: sql.NVarChar },
                { name: 'email', value: locationData.email || null, type: sql.NVarChar },
                { name: 'address1', value: locationData.address1 || null, type: sql.NVarChar },
                { name: 'address2', value: locationData.address2 || null, type: sql.NVarChar },
                { name: 'address3', value: locationData.address3 || null, type: sql.NVarChar },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar }
            ]);

            return new Location(result.recordset[0]);
        } catch (error) {
            throw error;
        }
    }

    // Get location by ID
    async getLocationById(locationCode) {
        try {
            const result = await executeStoredProcedure('sp_Location_GetById', [
                { name: 'locationCode', value: locationCode, type: sql.NVarChar }
            ]);

            if (result.recordset.length === 0) {
                return null;
            }

            return new Location(result.recordset[0]);
        } catch (error) {
            throw error;
        }
    }

    // Get all active locations
    async getAllActiveLocations() {
        try {
            const result = await executeStoredProcedure('sp_Location_GetAllActive');

            return result.recordset.map(row => new Location(row));
        } catch (error) {
            throw error;
        }
    }

    // Get all locations (with pagination)
    async getAllLocations(criteria = {}) {
        try {
            const searchCriteria = new LocationSearchCriteria(criteria);
            
            let isActiveValue = null;
            if (searchCriteria.isActive !== null) {
                isActiveValue = searchCriteria.isActive === true || 
                               searchCriteria.isActive === 'true' || 
                               searchCriteria.isActive === 1 || 
                               searchCriteria.isActive === '1';
            }

            const result = await executeStoredProcedure('sp_Location_GetAll', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar },
                { name: 'isActive', value: isActiveValue, type: sql.Bit },
                { name: 'mainLocation', value: searchCriteria.mainLocation, type: sql.NVarChar },
                { name: 'page', value: searchCriteria.page, type: sql.Int },
                { name: 'pageSize', value: searchCriteria.pageSize, type: sql.Int },
                { name: 'sortBy', value: searchCriteria.sortBy, type: sql.NVarChar },
                { name: 'sortOrder', value: searchCriteria.sortOrder, type: sql.NVarChar }
            ]);

            const locations = result.recordset.map(row => new Location(row));

            // Get total count
            const countResult = await executeStoredProcedure('sp_Location_Count', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar },
                { name: 'isActive', value: isActiveValue, type: sql.Bit },
                { name: 'mainLocation', value: searchCriteria.mainLocation, type: sql.NVarChar }
            ]);

            const total = countResult.recordset[0] ? countResult.recordset[0].TotalCount : 0;

            return {
                locations,
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

    // Get locations for dropdown (only code and description)
    async getLocationsForDropdown() {
        try {
            const result = await executeStoredProcedure('sp_Location_GetForDropdown');

            return result.recordset.map(row => ({
                locationCode: row.LOC_CODE,
                description: row.LOC_DESC,
                isActive: row.LOC_ACTIVE
            }));
        } catch (error) {
            throw error;
        }
    }

    // Delete location (soft delete - set inactive)
    async deleteLocation(locationCode, currentUser) {
        try {
            // Check if location is being used
            const isUsed = await this.checkLocationUsage(locationCode);
            if (isUsed) {
                throw new Error(`Cannot delete location '${locationCode}' as it is being used in the system`);
            }

            const result = await executeStoredProcedure('sp_Location_Delete', [
                { name: 'locationCode', value: locationCode, type: sql.NVarChar },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar }
            ]);

            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    // Check if location code already exists
    async checkDuplicateLocationCode(locationCode, excludeLocationCode = null) {
        try {
            const result = await executeStoredProcedure('sp_Location_CheckDuplicate', [
                { name: 'locationCode', value: locationCode, type: sql.NVarChar },
                { name: 'excludeLocationCode', value: excludeLocationCode, type: sql.NVarChar }
            ]);

            return result.recordset[0].IsDuplicate === 1;
        } catch (error) {
            throw error;
        }
    }

    // Check if location is being used in the system
    async checkLocationUsage(locationCode) {
        try {
            const result = await executeStoredProcedure('sp_Location_CheckUsage', [
                { name: 'locationCode', value: locationCode, type: sql.NVarChar }
            ]);

            return result.recordset[0].IsUsed === 1;
        } catch (error) {
            throw error;
        }
    }

    // Validate phone number (Sri Lankan format)
    validatePhoneNumber(phone) {
        if (!phone) return true;
        
        const cleanPhone = phone.replace(/[\s\-+]/g, '');
        
        // Sri Lankan mobile numbers: 07xxxxxxxx or 7xxxxxxxx or +947xxxxxxxx
        const mobileRegex = /^(?:\+94|0)?7[0-9]{8}$/;
        
        // Sri Lankan landline: 0xx xxxxxxx
        const landlineRegex = /^0[1-9][0-9]{7,8}$/;
        
        return mobileRegex.test(cleanPhone) || landlineRegex.test(cleanPhone);
    }

    // Validate email
    validateEmail(email) {
        if (!email) return true;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Format phone number
    formatPhoneNumber(phone) {
        if (!phone) return '';
        
        const cleanPhone = phone.replace(/[\s\-+]/g, '');
        
        if (cleanPhone.startsWith('94') && cleanPhone.length === 11) {
            return '+94 ' + cleanPhone.substring(2, 5) + ' ' + cleanPhone.substring(5, 8) + ' ' + cleanPhone.substring(8);
        } else if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
            return cleanPhone.substring(0, 3) + ' ' + cleanPhone.substring(3, 6) + ' ' + cleanPhone.substring(6);
        } else if (cleanPhone.startsWith('7') && cleanPhone.length === 9) {
            return '0' + cleanPhone.substring(0, 2) + ' ' + cleanPhone.substring(2, 5) + ' ' + cleanPhone.substring(5);
        }
        
        return phone;
    }
}

module.exports = new LocationService();