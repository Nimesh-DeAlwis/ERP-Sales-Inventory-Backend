const { executeStoredProcedure, sql } = require('../config/database');
const { SubDepartment, SubDepartmentSearchCriteria } = require('../models/subdepartment.model');

class SubDepartmentService {
    constructor() {}

    // Get all sub departments (for dropdown)
    async getAllSubDepartments() {
        try {
            const result = await executeStoredProcedure('sp_SubDepartment_GetAll', []);
            
            if (!result.recordset || result.recordset.length === 0) {
                return [];
            }

            return result.recordset.map(row => new SubDepartment(row));
        } catch (error) {
            console.error('Error getting all sub departments:', error);
            throw new Error('Unable to fetch sub departments');
        }
    }

    // Get next sub department code
    async getNextSubDepartmentCode() {
        try {
            const result = await executeStoredProcedure('sp_SubDepartment_GetNextCode', []);
            
            if (result.recordset && result.recordset.length > 0) {
                return result.recordset[0].NextSubDepartmentCode;
            }
            
            return '0001';
        } catch (error) {
            console.error('Error getting next sub department code:', error);
            return '0001';
        }
    }

    // Create sub department
    async createSubDepartment(subDepartmentData, currentUser) {
        try {
            // Check if sub department code already exists
            const existing = await this.getSubDepartmentByCode(subDepartmentData.subDepartmentCode);
            if (existing) {
                throw new Error(`Sub Department code '${subDepartmentData.subDepartmentCode}' already exists`);
            }

            await executeStoredProcedure('sp_SubDepartment_Create', [
                { name: 'gpCode', value: subDepartmentData.subDepartmentCode, type: sql.NVarChar(4) },
                { name: 'gpDesc', value: subDepartmentData.description, type: sql.NVarChar(50) },
                { name: 'gpStatus', value: subDepartmentData.status !== undefined ? subDepartmentData.status : true, type: sql.Bit },
                { name: 'createdBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return await this.getSubDepartmentByCode(subDepartmentData.subDepartmentCode);
        } catch (error) {
            throw error;
        }
    }

    // Update sub department
    async updateSubDepartment(subDepartmentCode, subDepartmentData, currentUser) {
        try {
            await executeStoredProcedure('sp_SubDepartment_Update', [
                { name: 'gpCode', value: subDepartmentCode, type: sql.NVarChar(4) },
                { name: 'gpDesc', value: subDepartmentData.description, type: sql.NVarChar(50) },
                { name: 'gpStatus', value: subDepartmentData.status !== undefined ? subDepartmentData.status : true, type: sql.Bit },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return await this.getSubDepartmentByCode(subDepartmentCode);
        } catch (error) {
            throw error;
        }
    }

    // Get sub department by code
    async getSubDepartmentByCode(subDepartmentCode) {
        try {
            const result = await executeStoredProcedure('sp_SubDepartment_GetByCode', [
                { name: 'gpCode', value: subDepartmentCode, type: sql.NVarChar(4) }
            ]);

            if (result.recordset.length === 0) {
                return null;
            }

            return new SubDepartment(result.recordset[0]);
        } catch (error) {
            throw error;
        }
    }

    // Search sub departments with pagination
    async searchSubDepartments(criteria) {
        try {
            const searchCriteria = new SubDepartmentSearchCriteria(criteria);
            
            let statusValue = null;
            if (searchCriteria.status !== null) {
                statusValue = searchCriteria.status === true || 
                             searchCriteria.status === 'true' || 
                             searchCriteria.status === 1 || 
                             searchCriteria.status === '1';
            }

            const result = await executeStoredProcedure('sp_SubDepartment_Search', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar(100) },
                { name: 'status', value: statusValue, type: sql.Bit },
                { name: 'page', value: searchCriteria.page, type: sql.Int },
                { name: 'pageSize', value: searchCriteria.pageSize, type: sql.Int },
                { name: 'sortBy', value: searchCriteria.sortBy, type: sql.NVarChar(50) },
                { name: 'sortOrder', value: searchCriteria.sortOrder, type: sql.NVarChar(4) }
            ]);

            const subDepartments = result.recordset.map(row => new SubDepartment(row));

            const countResult = await executeStoredProcedure('sp_SubDepartment_Count', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar(100) },
                { name: 'status', value: statusValue, type: sql.Bit }
            ]);

            const total = countResult.recordset[0] ? countResult.recordset[0].TotalCount : 0;

            return {
                subDepartments,
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

    // Delete sub department
    async deleteSubDepartment(subDepartmentCode, currentUser) {
        try {
            const result = await executeStoredProcedure('sp_SubDepartment_Delete', [
                { name: 'gpCode', value: subDepartmentCode, type: sql.NVarChar(4) },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    // Check duplicate sub department code
    async checkDuplicateSubDepartmentCode(subDepartmentCode, excludeSubDepartmentCode = null) {
        try {
            const result = await executeStoredProcedure('sp_SubDepartment_CheckDuplicate', [
                { name: 'gpCode', value: subDepartmentCode, type: sql.NVarChar(4) },
                { name: 'excludeGpCode', value: excludeSubDepartmentCode, type: sql.NVarChar(4) }
            ]);
            
            return result.recordset[0].IsDuplicate === 1;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new SubDepartmentService();