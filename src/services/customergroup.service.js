// src/services/customergroup.service.js
const { executeStoredProcedure, sql } = require('../config/database');
const { CustomerGroup, CustomerGroupSearchCriteria } = require('../models/customergroup.model');

class CustomerGroupService {
    constructor() {}

    // Get all customer groups (for dropdown)
    async getAllCustomerGroups() {
        try {
            const result = await executeStoredProcedure('sp_CustomerGroup_GetAll', []);
            
            if (!result.recordset || result.recordset.length === 0) {
                return [];
            }

            return result.recordset.map(row => new CustomerGroup(row));
        } catch (error) {
            console.error('Error getting all customer groups:', error);
            throw new Error('Unable to fetch customer groups');
        }
    }

    // Search customer groups with pagination
    async searchCustomerGroups(criteria) {
        try {
            console.log('Search criteria in service:', criteria);
            const searchCriteria = new CustomerGroupSearchCriteria(criteria);
            
            let statusValue = null;
            if (searchCriteria.status !== null) {
                statusValue = searchCriteria.status === true || 
                             searchCriteria.status === 'true' || 
                             searchCriteria.status === 1 || 
                             searchCriteria.status === '1';
            }

            console.log('Executing sp_CustomerGroup_Search with params:', {
                searchText: searchCriteria.searchText,
                status: statusValue,
                page: searchCriteria.page,
                pageSize: searchCriteria.pageSize,
                sortBy: searchCriteria.sortBy,
                sortOrder: searchCriteria.sortOrder
            });

            const result = await executeStoredProcedure('sp_CustomerGroup_Search', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar },
                { name: 'status', value: statusValue, type: sql.Bit },
                { name: 'page', value: searchCriteria.page, type: sql.Int },
                { name: 'pageSize', value: searchCriteria.pageSize, type: sql.Int },
                { name: 'sortBy', value: searchCriteria.sortBy, type: sql.NVarChar },
                { name: 'sortOrder', value: searchCriteria.sortOrder, type: sql.NVarChar }
            ]);

            console.log('Search result recordset length:', result.recordset?.length);

            const groups = result.recordset.map(row => new CustomerGroup(row));

            // Get total count
            const countResult = await executeStoredProcedure('sp_CustomerGroup_Count', [
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
            console.error('Error in searchCustomerGroups:', error);
            throw error;
        }
    }

    // Create customer group
    async createCustomerGroup(groupData, currentUser) {
        try {
            // Check if group code already exists
            const existing = await this.getCustomerGroupByCode(groupData.groupCode);
            if (existing) {
                throw new Error(`Customer group code '${groupData.groupCode}' already exists`);
            }

            await executeStoredProcedure('sp_CustomerGroup_Create', [
                { name: 'cgCode', value: groupData.groupCode, type: sql.NVarChar },
                { name: 'cgDesc', value: groupData.description, type: sql.NVarChar },
                { name: 'cgStatus', value: groupData.status !== undefined ? groupData.status : true, type: sql.Bit },
                { name: 'createdBy', value: currentUser, type: sql.NVarChar }
            ]);

            return await this.getCustomerGroupByCode(groupData.groupCode);
        } catch (error) {
            throw error;
        }
    }

    // Update customer group
    async updateCustomerGroup(groupCode, groupData, currentUser) {
        try {
            await executeStoredProcedure('sp_CustomerGroup_Update', [
                { name: 'cgCode', value: groupCode, type: sql.NVarChar },
                { name: 'cgDesc', value: groupData.description, type: sql.NVarChar },
                { name: 'cgStatus', value: groupData.status !== undefined ? groupData.status : true, type: sql.Bit },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar }
            ]);

            return await this.getCustomerGroupByCode(groupCode);
        } catch (error) {
            throw error;
        }
    }

    // Get customer group by code
    async getCustomerGroupByCode(groupCode) {
        try {
            const result = await executeStoredProcedure('sp_CustomerGroup_GetByCode', [
                { name: 'cgCode', value: groupCode, type: sql.NVarChar }
            ]);

            if (result.recordset.length === 0) {
                return null;
            }

            return new CustomerGroup(result.recordset[0]);
        } catch (error) {
            throw error;
        }
    }

    // Delete customer group
    async deleteCustomerGroup(groupCode, currentUser) {
        try {
            const result = await executeStoredProcedure('sp_CustomerGroup_Delete', [
                { name: 'cgCode', value: groupCode, type: sql.NVarChar },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar }
            ]);

            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    // Check duplicate customer group code
    async checkDuplicateCustomerGroupCode(groupCode, excludeGroupCode = null) {
        try {
            const result = await executeStoredProcedure('sp_CustomerGroup_CheckDuplicate', [
                { name: 'cgCode', value: groupCode, type: sql.NVarChar },
                { name: 'excludeCgCode', value: excludeGroupCode, type: sql.NVarChar }
            ]);
            
            return result.recordset[0].IsDuplicate === 1;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new CustomerGroupService();