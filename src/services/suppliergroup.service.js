const { executeStoredProcedure, sql } = require('../config/database');
const { SupplierGroup, SupplierGroupSearchCriteria } = require('../models/suppliergroup.model');

class SupplierGroupService {
    constructor() {}

    // Get all supplier groups (for dropdown)
    async getAllSupplierGroups() {
        try {
            const result = await executeStoredProcedure('sp_SupplierGroup_GetAll', []);
            
            if (!result.recordset || result.recordset.length === 0) {
                return [];
            }

            return result.recordset.map(row => new SupplierGroup(row));
        } catch (error) {
            console.error('Error getting all supplier groups:', error);
            throw new Error('Unable to fetch supplier groups');
        }
    }

    // Get next supplier group code
    async getNextSupplierGroupCode() {
        try {
            const result = await executeStoredProcedure('sp_SupplierGroup_GetNextCode', []);
            
            if (result.recordset && result.recordset.length > 0) {
                return result.recordset[0].NextGroupCode;
            }
            
            return '00001';
        } catch (error) {
            console.error('Error getting next supplier group code:', error);
            return '00001';
        }
    }

    // Create supplier group
    async createSupplierGroup(groupData, currentUser) {
        try {
            // Check if group code already exists
            const existing = await this.getSupplierGroupByCode(groupData.groupCode);
            if (existing) {
                throw new Error(`Supplier group code '${groupData.groupCode}' already exists`);
            }

            await executeStoredProcedure('sp_SupplierGroup_Create', [
                { name: 'sgCode', value: groupData.groupCode, type: sql.NVarChar(5) },
                { name: 'sgDesc', value: groupData.description, type: sql.NVarChar(sql.MAX) },
                { name: 'sgStatus', value: groupData.status !== undefined ? groupData.status : true, type: sql.Bit },
                { name: 'createdBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return await this.getSupplierGroupByCode(groupData.groupCode);
        } catch (error) {
            throw error;
        }
    }

    // Update supplier group
    async updateSupplierGroup(groupCode, groupData, currentUser) {
        try {
            await executeStoredProcedure('sp_SupplierGroup_Update', [
                { name: 'sgCode', value: groupCode, type: sql.NVarChar(5) },
                { name: 'sgDesc', value: groupData.description, type: sql.NVarChar(sql.MAX) },
                { name: 'sgStatus', value: groupData.status !== undefined ? groupData.status : true, type: sql.Bit },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return await this.getSupplierGroupByCode(groupCode);
        } catch (error) {
            throw error;
        }
    }

    // Get supplier group by code
    async getSupplierGroupByCode(groupCode) {
        try {
            const result = await executeStoredProcedure('sp_SupplierGroup_GetByCode', [
                { name: 'sgCode', value: groupCode, type: sql.NVarChar(5) }
            ]);

            if (result.recordset.length === 0) {
                return null;
            }

            return new SupplierGroup(result.recordset[0]);
        } catch (error) {
            throw error;
        }
    }

    // Search supplier groups with pagination
    async searchSupplierGroups(criteria) {
        try {
            const searchCriteria = new SupplierGroupSearchCriteria(criteria);
            
            let statusValue = null;
            if (searchCriteria.status !== null) {
                statusValue = searchCriteria.status === true || 
                             searchCriteria.status === 'true' || 
                             searchCriteria.status === 1 || 
                             searchCriteria.status === '1';
            }

            const result = await executeStoredProcedure('sp_SupplierGroup_Search', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar(100) },
                { name: 'status', value: statusValue, type: sql.Bit },
                { name: 'page', value: searchCriteria.page, type: sql.Int },
                { name: 'pageSize', value: searchCriteria.pageSize, type: sql.Int },
                { name: 'sortBy', value: searchCriteria.sortBy, type: sql.NVarChar(50) },
                { name: 'sortOrder', value: searchCriteria.sortOrder, type: sql.NVarChar(4) }
            ]);

            const groups = result.recordset.map(row => new SupplierGroup(row));

            const countResult = await executeStoredProcedure('sp_SupplierGroup_Count', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar(100) },
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

    // Delete supplier group
    async deleteSupplierGroup(groupCode, currentUser) {
        try {
            const result = await executeStoredProcedure('sp_SupplierGroup_Delete', [
                { name: 'sgCode', value: groupCode, type: sql.NVarChar(5) },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    // Check duplicate supplier group code
    async checkDuplicateSupplierGroupCode(groupCode, excludeGroupCode = null) {
        try {
            const result = await executeStoredProcedure('sp_SupplierGroup_CheckDuplicate', [
                { name: 'sgCode', value: groupCode, type: sql.NVarChar(5) },
                { name: 'excludeSgCode', value: excludeGroupCode, type: sql.NVarChar(5) }
            ]);
            
            return result.recordset[0].IsDuplicate === 1;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new SupplierGroupService();