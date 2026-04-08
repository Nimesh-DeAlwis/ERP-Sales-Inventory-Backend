const { executeStoredProcedure, sql } = require('../../../config/database');
const { PVGroup, PVGroupSearchCriteria } = require('../../../models/vouchers/physicalvoucher/pvgroup.model');

class PVGroupService {
    constructor() {}

    // Get next voucher group code
    async getNextCode() {
        try {
            const result = await executeStoredProcedure('sp_PVGroup_GetNextCode', []);
            return result.recordset[0].NextCode;
        } catch (error) {
            console.error('Error getting next code:', error);
            throw error;
        }
    }

    // Create Voucher Group
    async createPVGroup(data, currentUser) {
        try {
            const result = await executeStoredProcedure('sp_PVGroup_Create', [
                { name: 'code', value: data.code, type: sql.NVarChar(3) },
                { name: 'description', value: data.description, type: sql.NVarChar(100) },
                { name: 'status', value: data.status ? 1 : 0, type: sql.Bit },
                { name: 'value', value: data.value, type: sql.Numeric(18,2) },
                { name: 'expDays', value: data.expDays, type: sql.Numeric(18,0) },
                { name: 'cost', value: data.cost || 0, type: sql.Numeric(18,2) },
                { name: 'bookQty', value: data.bookQty || 0, type: sql.Numeric(18,0) },
                { name: 'bookNo', value: data.bookNo || 0, type: sql.Numeric(18,0) },
                { name: 'createdBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return {
                success: true,
                message: 'Voucher Group created successfully',
                data: { code: data.code }
            };
        } catch (error) {
            console.error('Error in createPVGroup:', error);
            throw error;
        }
    }

    // Update Voucher Group
    async updatePVGroup(code, data, currentUser) {
        try {
            const result = await executeStoredProcedure('sp_PVGroup_Update', [
                { name: 'code', value: code, type: sql.NVarChar(3) },
                { name: 'description', value: data.description, type: sql.NVarChar(100) },
                { name: 'status', value: data.status ? 1 : 0, type: sql.Bit },
                { name: 'value', value: data.value, type: sql.Numeric(18,2) },
                { name: 'expDays', value: data.expDays, type: sql.Numeric(18,0) },
                { name: 'cost', value: data.cost || 0, type: sql.Numeric(18,2) },
                { name: 'bookQty', value: data.bookQty || 0, type: sql.Numeric(18,0) },
                { name: 'bookNo', value: data.bookNo || 0, type: sql.Numeric(18,0) },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return {
                success: true,
                message: 'Voucher Group updated successfully',
                data: { code: code }
            };
        } catch (error) {
            console.error('Error in updatePVGroup:', error);
            throw error;
        }
    }

    // Delete Voucher Group
    async deletePVGroup(code) {
        try {
            const result = await executeStoredProcedure('sp_PVGroup_Delete', [
                { name: 'code', value: code, type: sql.NVarChar(3) }
            ]);

            return {
                success: true,
                message: 'Voucher Group deleted successfully'
            };
        } catch (error) {
            console.error('Error in deletePVGroup:', error);
            throw error;
        }
    }

    // Get Voucher Group by code
    async getPVGroupByCode(code) {
        try {
            const result = await executeStoredProcedure('sp_PVGroup_GetByCode', [
                { name: 'code', value: code, type: sql.NVarChar(3) }
            ]);

            if (result.recordset.length === 0) {
                return null;
            }

            return new PVGroup(result.recordset[0]);
        } catch (error) {
            console.error('Error in getPVGroupByCode:', error);
            throw error;
        }
    }

    // Get all Voucher Groups
    async getAllPVGroups() {
        try {
            const result = await executeStoredProcedure('sp_PVGroup_GetAll', []);
            return result.recordset.map(row => new PVGroup(row));
        } catch (error) {
            console.error('Error in getAllPVGroups:', error);
            throw error;
        }
    }

    // Search Voucher Groups
    async searchPVGroups(criteria) {
        try {
            const searchCriteria = new PVGroupSearchCriteria(criteria);

            const result = await executeStoredProcedure('sp_PVGroup_Search', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar(100) },
                { name: 'status', value: searchCriteria.status, type: sql.Bit },
                { name: 'page', value: searchCriteria.page, type: sql.Int },
                { name: 'pageSize', value: searchCriteria.pageSize, type: sql.Int }
            ]);

            const groups = result.recordset.map(row => new PVGroup(row));

            // Get total count from another recordset if available
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
            console.error('Error in searchPVGroups:', error);
            throw error;
        }
    }

    // Update Group Status
    async updateStatus(code, status, currentUser) {
        try {
            const result = await executeStoredProcedure('sp_PVGroup_UpdateStatus', [
                { name: 'code', value: code, type: sql.NVarChar(3) },
                { name: 'status', value: status ? 1 : 0, type: sql.Bit },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return {
                success: true,
                message: `Voucher Group ${status ? 'activated' : 'deactivated'} successfully`
            };
        } catch (error) {
            console.error('Error in updateStatus:', error);
            throw error;
        }
    }
}

module.exports = new PVGroupService();