const { executeStoredProcedure, sql } = require('../config/database');
const { Department, DepartmentSearchCriteria } = require('../models/department.model');

class DepartmentService {
    constructor() {}

    // Get all departments (for dropdown)
    async getAllDepartments() {
        try {
            const result = await executeStoredProcedure('sp_Department_GetAll', []);
            
            if (!result.recordset || result.recordset.length === 0) {
                return [];
            }

            return result.recordset.map(row => new Department(row));
        } catch (error) {
            console.error('Error getting all departments:', error);
            throw new Error('Unable to fetch departments');
        }
    }

    // Get next department code
    async getNextDepartmentCode() {
        try {
            const result = await executeStoredProcedure('sp_Department_GetNextCode', []);
            
            if (result.recordset && result.recordset.length > 0) {
                return result.recordset[0].NextDepartmentCode;
            }
            
            return '0001';
        } catch (error) {
            console.error('Error getting next department code:', error);
            return '0001';
        }
    }

    // Create department
    async createDepartment(departmentData, currentUser) {
        try {
            // Check if department code already exists
            const existing = await this.getDepartmentByCode(departmentData.departmentCode);
            if (existing) {
                throw new Error(`Department code '${departmentData.departmentCode}' already exists`);
            }

            await executeStoredProcedure('sp_Department_Create', [
                { name: 'gpCode', value: departmentData.departmentCode, type: sql.NVarChar(4) },
                { name: 'gpDesc', value: departmentData.description, type: sql.NVarChar(50) },
                { name: 'gpStatus', value: departmentData.status !== undefined ? departmentData.status : true, type: sql.Bit },
                { name: 'createdBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return await this.getDepartmentByCode(departmentData.departmentCode);
        } catch (error) {
            throw error;
        }
    }

    // Update department
    async updateDepartment(departmentCode, departmentData, currentUser) {
        try {
            await executeStoredProcedure('sp_Department_Update', [
                { name: 'gpCode', value: departmentCode, type: sql.NVarChar(4) },
                { name: 'gpDesc', value: departmentData.description, type: sql.NVarChar(50) },
                { name: 'gpStatus', value: departmentData.status !== undefined ? departmentData.status : true, type: sql.Bit },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return await this.getDepartmentByCode(departmentCode);
        } catch (error) {
            throw error;
        }
    }

    // Get department by code
    async getDepartmentByCode(departmentCode) {
        try {
            const result = await executeStoredProcedure('sp_Department_GetByCode', [
                { name: 'gpCode', value: departmentCode, type: sql.NVarChar(4) }
            ]);

            if (result.recordset.length === 0) {
                return null;
            }

            return new Department(result.recordset[0]);
        } catch (error) {
            throw error;
        }
    }

    // Search departments with pagination
    async searchDepartments(criteria) {
        try {
            const searchCriteria = new DepartmentSearchCriteria(criteria);
            
            let statusValue = null;
            if (searchCriteria.status !== null) {
                statusValue = searchCriteria.status === true || 
                             searchCriteria.status === 'true' || 
                             searchCriteria.status === 1 || 
                             searchCriteria.status === '1';
            }

            const result = await executeStoredProcedure('sp_Department_Search', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar(100) },
                { name: 'status', value: statusValue, type: sql.Bit },
                { name: 'page', value: searchCriteria.page, type: sql.Int },
                { name: 'pageSize', value: searchCriteria.pageSize, type: sql.Int },
                { name: 'sortBy', value: searchCriteria.sortBy, type: sql.NVarChar(50) },
                { name: 'sortOrder', value: searchCriteria.sortOrder, type: sql.NVarChar(4) }
            ]);

            const departments = result.recordset.map(row => new Department(row));

            const countResult = await executeStoredProcedure('sp_Department_Count', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar(100) },
                { name: 'status', value: statusValue, type: sql.Bit }
            ]);

            const total = countResult.recordset[0] ? countResult.recordset[0].TotalCount : 0;

            return {
                departments,
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

    // Delete department
    async deleteDepartment(departmentCode, currentUser) {
        try {
            const result = await executeStoredProcedure('sp_Department_Delete', [
                { name: 'gpCode', value: departmentCode, type: sql.NVarChar(4) },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    // Check duplicate department code
    async checkDuplicateDepartmentCode(departmentCode, excludeDepartmentCode = null) {
        try {
            const result = await executeStoredProcedure('sp_Department_CheckDuplicate', [
                { name: 'gpCode', value: departmentCode, type: sql.NVarChar(4) },
                { name: 'excludeGpCode', value: excludeDepartmentCode, type: sql.NVarChar(4) }
            ]);
            
            return result.recordset[0].IsDuplicate === 1;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new DepartmentService();