const { executeStoredProcedure, sql } = require('../../../config/database');
const { EVGroup, EVGroupSearchCriteria } = require('../../../models/vouchers/evoucher/evgroup.model');

class EVGroupService {
    constructor() {}

    // Get next voucher group code
    async getNextCode() {
        try {
            const result = await executeStoredProcedure('sp_EVGroup_GetNextCode', []);
            return result.recordset[0].NextCode;
        } catch (error) {
            console.error('Error getting next code:', error);
            throw error;
        }
    }

    // Create E-Voucher Group
    async createEVGroup(data, currentUser) {
        try {
            const result = await executeStoredProcedure('sp_EVGroup_Create', [
                { name: 'code', value: data.code, type: sql.NVarChar(3) },
                { name: 'description', value: data.description, type: sql.NVarChar(100) },
                { name: 'status', value: data.status ? 1 : 0, type: sql.Bit },
                { name: 'value', value: data.value, type: sql.Numeric(18,2) },
                { name: 'expDays', value: data.expDays, type: sql.Numeric(18,0) },
                { name: 'createdBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return {
                success: true,
                message: 'E-Voucher Group created successfully',
                data: { code: data.code }
            };
        } catch (error) {
            console.error('Error in createEVGroup:', error);
            throw error;
        }
    }

    // Update E-Voucher Group
    async updateEVGroup(code, data, currentUser) {
        try {
            const result = await executeStoredProcedure('sp_EVGroup_Update', [
                { name: 'code', value: code, type: sql.NVarChar(3) },
                { name: 'description', value: data.description, type: sql.NVarChar(100) },
                { name: 'status', value: data.status ? 1 : 0, type: sql.Bit },
                { name: 'value', value: data.value, type: sql.Numeric(18,2) },
                { name: 'expDays', value: data.expDays, type: sql.Numeric(18,0) },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return {
                success: true,
                message: 'E-Voucher Group updated successfully',
                data: { code: code }
            };
        } catch (error) {
            console.error('Error in updateEVGroup:', error);
            throw error;
        }
    }

    // Delete E-Voucher Group
    async deleteEVGroup(code) {
        try {
            const result = await executeStoredProcedure('sp_EVGroup_Delete', [
                { name: 'code', value: code, type: sql.NVarChar(3) }
            ]);

            return {
                success: true,
                message: 'E-Voucher Group deleted successfully'
            };
        } catch (error) {
            console.error('Error in deleteEVGroup:', error);
            throw error;
        }
    }

    // Get E-Voucher Group by code
    async getEVGroupByCode(code) {
        try {
            const result = await executeStoredProcedure('sp_EVGroup_GetByCode', [
                { name: 'code', value: code, type: sql.NVarChar(3) }
            ]);

            if (result.recordset.length === 0) {
                return null;
            }

            return new EVGroup(result.recordset[0]);
        } catch (error) {
            console.error('Error in getEVGroupByCode:', error);
            throw error;
        }
    }
 
    // Get all E-Voucher Groups
    async getAllEVGroups() {
        try {
            const result = await executeStoredProcedure('sp_EVGroup_GetAll', []);
            return result.recordset.map(row => new EVGroup(row));
        } catch (error) {
            console.error('Error in getAllEVGroups:', error);
            throw error;
        }
    }

    // Search E-Voucher Groups
    async searchEVGroups(criteria) {
        try {
            const searchCriteria = new EVGroupSearchCriteria(criteria);

            const result = await executeStoredProcedure('sp_EVGroup_Search', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar(100) },
                { name: 'status', value: searchCriteria.status, type: sql.Bit },
                { name: 'page', value: searchCriteria.page, type: sql.Int },
                { name: 'pageSize', value: searchCriteria.pageSize, type: sql.Int }
            ]);

            const groups = result.recordset.map(row => new EVGroup(row));

            let total = groups.length;
            if (result.recordsets[1] && result.recordsets[1][0]) {
                total = result.recordsets[1][0].TotalCount;
            }

            return {
                groups,
                pagination: {
                    page: searchCriteria.page,
                    pageSize: searchCriteria.pageSize,
                    total: total
                }
            };
        } catch (error) {
            console.error('Error in searchEVGroups:', error);
            throw error;
        }
    }

    // Update Group Status
    async updateStatus(code, status, currentUser) {
        try {
            const result = await executeStoredProcedure('sp_EVGroup_UpdateStatus', [
                { name: 'code', value: code, type: sql.NVarChar(3) },
                { name: 'status', value: status ? 1 : 0, type: sql.Bit },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return {
                success: true,
                message: `E-Voucher Group ${status ? 'activated' : 'deactivated'} successfully`
            };
        } catch (error) {
            console.error('Error in updateStatus:', error);
            throw error;
        }
    }
}

module.exports = new EVGroupService();