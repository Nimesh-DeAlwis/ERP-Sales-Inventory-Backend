const { executeStoredProcedure, sql } = require('../config/database');
const { Supplier, SupplierSearchCriteria } = require('../models/supplier.model');

class SupplierService {
    constructor() {}

    // Get next supplier code
    async getNextSupplierCode() {
        try {
            const result = await executeStoredProcedure('sp_Supplier_GetNextCode', []);
            
            if (result.recordset && result.recordset.length > 0) {
                return result.recordset[0].NextSupplierCode;
            }
            
            return '0000000001';
        } catch (error) {
            console.error('Error getting next supplier code:', error);
            return '0000000001';
        }
    }

    // Create supplier
    async createSupplier(supplierData, currentUser) {
        try {
            // Check if supplier code already exists
            const existing = await this.getSupplierByCode(supplierData.supplierCode);
            if (existing) {
                throw new Error(`Supplier code '${supplierData.supplierCode}' already exists`);
            }

            await executeStoredProcedure('sp_Supplier_Create', [
                { name: 'smCode', value: supplierData.supplierCode, type: sql.NVarChar(10) },
                { name: 'smName', value: supplierData.name, type: sql.NVarChar(sql.MAX) },
                { name: 'smGroup', value: supplierData.groupCode, type: sql.NVarChar(5) },
                { name: 'smStatus', value: supplierData.status !== undefined ? supplierData.status : true, type: sql.Bit },
                { name: 'smAdd1', value: supplierData.address1 || '', type: sql.NVarChar(150) },
                { name: 'smAdd2', value: supplierData.address2 || null, type: sql.NVarChar(50) },
                { name: 'smMobile1', value: supplierData.mobile1 || null, type: sql.NVarChar(40) },
                { name: 'smMobile2', value: supplierData.mobile2 || null, type: sql.NVarChar(40) },
                { name: 'smPhone', value: supplierData.phone || null, type: sql.NVarChar(40) },
                { name: 'smEmail', value: supplierData.email || null, type: sql.NVarChar(sql.MAX) },
                { name: 'smAccount', value: supplierData.account || null, type: sql.NVarChar(30) },
                { name: 'smRefCode', value: supplierData.refCode || null, type: sql.NVarChar(10) },
                { name: 'smBankName', value: supplierData.bankName || null, type: sql.NVarChar(100) },
                { name: 'smBankCode', value: supplierData.bankCode || null, type: sql.NVarChar(20) },
                { name: 'smBranchName', value: supplierData.branchName || null, type: sql.NVarChar(100) },
                { name: 'smBranchCode', value: supplierData.branchCode || null, type: sql.NVarChar(20) },
                { name: 'smAccountNo', value: supplierData.accountNo || null, type: sql.NVarChar(50) },
                { name: 'smPayeeName', value: supplierData.payeeName || null, type: sql.NVarChar(100) },
                { name: 'createdBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return await this.getSupplierByCode(supplierData.supplierCode);
        } catch (error) {
            console.error('Error in createSupplier:', error);
            throw error;
        }
    }

    // Update supplier
    async updateSupplier(supplierCode, supplierData, currentUser) {
        try {
            await executeStoredProcedure('sp_Supplier_Update', [
                { name: 'smCode', value: supplierCode, type: sql.NVarChar(10) },
                { name: 'smName', value: supplierData.name, type: sql.NVarChar(sql.MAX) },
                { name: 'smGroup', value: supplierData.groupCode, type: sql.NVarChar(5) },
                { name: 'smStatus', value: supplierData.status !== undefined ? supplierData.status : true, type: sql.Bit },
                { name: 'smAdd1', value: supplierData.address1 || '', type: sql.NVarChar(150) },
                { name: 'smAdd2', value: supplierData.address2 || null, type: sql.NVarChar(50) },
                { name: 'smMobile1', value: supplierData.mobile1 || null, type: sql.NVarChar(40) },
                { name: 'smMobile2', value: supplierData.mobile2 || null, type: sql.NVarChar(40) },
                { name: 'smPhone', value: supplierData.phone || null, type: sql.NVarChar(40) },
                { name: 'smEmail', value: supplierData.email || null, type: sql.NVarChar(sql.MAX) },
                { name: 'smAccount', value: supplierData.account || null, type: sql.NVarChar(30) },
                { name: 'smRefCode', value: supplierData.refCode || null, type: sql.NVarChar(10) },
                { name: 'smBankName', value: supplierData.bankName || null, type: sql.NVarChar(100) },
                { name: 'smBankCode', value: supplierData.bankCode || null, type: sql.NVarChar(20) },
                { name: 'smBranchName', value: supplierData.branchName || null, type: sql.NVarChar(100) },
                { name: 'smBranchCode', value: supplierData.branchCode || null, type: sql.NVarChar(20) },
                { name: 'smAccountNo', value: supplierData.accountNo || null, type: sql.NVarChar(50) },
                { name: 'smPayeeName', value: supplierData.payeeName || null, type: sql.NVarChar(100) },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return await this.getSupplierByCode(supplierCode);
        } catch (error) {
            console.error('Error in updateSupplier:', error);
            throw error;
        }
    }

    // Get supplier by code
    async getSupplierByCode(supplierCode) {
        try {
            const result = await executeStoredProcedure('sp_Supplier_GetByCode', [
                { name: 'smCode', value: supplierCode, type: sql.NVarChar(10) }
            ]);

            if (result.recordset.length === 0) {
                return null;
            }

            return new Supplier(result.recordset[0]);
        } catch (error) {
            console.error('Error in getSupplierByCode:', error);
            throw error;
        }
    }

    // Search suppliers with pagination
    async searchSuppliers(criteria) {
        try {
            const searchCriteria = new SupplierSearchCriteria(criteria);
            
            let statusValue = null;
            if (searchCriteria.status !== null) {
                statusValue = searchCriteria.status === true || 
                             searchCriteria.status === 'true' || 
                             searchCriteria.status === 1 || 
                             searchCriteria.status === '1';
            }

            const result = await executeStoredProcedure('sp_Supplier_Search', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar(100) },
                { name: 'status', value: statusValue, type: sql.Bit },
                { name: 'groupCode', value: searchCriteria.groupCode, type: sql.NVarChar(5) },
                { name: 'page', value: searchCriteria.page, type: sql.Int },
                { name: 'pageSize', value: searchCriteria.pageSize, type: sql.Int },
                { name: 'sortBy', value: searchCriteria.sortBy, type: sql.NVarChar(50) },
                { name: 'sortOrder', value: searchCriteria.sortOrder, type: sql.NVarChar(4) }
            ]);

            const suppliers = result.recordset.map(row => new Supplier(row));

            const countResult = await executeStoredProcedure('sp_Supplier_Count', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar(100) },
                { name: 'status', value: statusValue, type: sql.Bit },
                { name: 'groupCode', value: searchCriteria.groupCode, type: sql.NVarChar(5) }
            ]);

            const total = countResult.recordset[0] ? countResult.recordset[0].TotalCount : 0;

            return {
                suppliers,
                pagination: {
                    page: searchCriteria.page,
                    pageSize: searchCriteria.pageSize,
                    total,
                    totalPages: Math.ceil(total / searchCriteria.pageSize)
                }
            };
        } catch (error) {
            console.error('Error in searchSuppliers:', error);
            throw error;
        }
    }

    // Delete supplier
    async deleteSupplier(supplierCode, currentUser) {
        try {
            const result = await executeStoredProcedure('sp_Supplier_Delete', [
                { name: 'smCode', value: supplierCode, type: sql.NVarChar(10) },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return result.recordset[0];
        } catch (error) {
            console.error('Error in deleteSupplier:', error);
            throw error;
        }
    }

    // Check duplicate supplier code
    async checkDuplicateSupplierCode(supplierCode, excludeSupplierCode = null) {
        try {
            const result = await executeStoredProcedure('sp_Supplier_CheckDuplicate', [
                { name: 'smCode', value: supplierCode, type: sql.NVarChar(10) },
                { name: 'excludeSmCode', value: excludeSupplierCode, type: sql.NVarChar(10) }
            ]);
            
            return result.recordset[0].IsDuplicate === 1;
        } catch (error) {
            console.error('Error in checkDuplicateSupplierCode:', error);
            throw error;
        }
    }
}

module.exports = new SupplierService();