const { executeStoredProcedure, sql } = require('../config/database');
const { Customer, CustomerSearchCriteria } = require('../models/customer.model');

class CustomerService {
    constructor() {}

    // Create customer
    async createCustomer(customerData, currentUser) {
        try {
            // Check if customer code already exists
            const existing = await this.getCustomerByCode(customerData.customerCode);
            if (existing) {
                throw new Error(`Customer code '${customerData.customerCode}' already exists`);
            }

            // Ensure photo is null (not sent during creation)
            const photoValue = null;

            console.log('Creating customer with data:', JSON.stringify(customerData, null, 2));

            await executeStoredProcedure('sp_Customer_Create', [
                { name: 'cmCode', value: customerData.customerCode, type: sql.NVarChar(30) },
                { name: 'cmTitle', value: customerData.titleCode, type: sql.NVarChar(50) },
                { name: 'cmFName', value: customerData.firstName, type: sql.NVarChar(150) },
                { name: 'cmLName', value: customerData.lastName || null, type: sql.NVarChar(100) },
                { name: 'cmFullName', value: customerData.fullName, type: sql.NVarChar(150) },
                { name: 'cmGroup', value: customerData.groupCode, type: sql.NVarChar(5) },
                { name: 'cmNic', value: customerData.nic || null, type: sql.NVarChar(50) },
                { name: 'cmStatus', value: customerData.status !== undefined ? customerData.status : true, type: sql.Bit },
                { name: 'cmPhoto', value: photoValue, type: sql.NVarChar(50) }, // CORRECTED: NVARCHAR(50)
                { name: 'cmAdd1', value: customerData.address1 || null, type: sql.NVarChar(150) },
                { name: 'cmMobile1', value: customerData.mobile1 || null, type: sql.NVarChar(25) },
                { name: 'cmMobile2', value: customerData.mobile2 || null, type: sql.NVarChar(13) },
                { name: 'cmPhone1', value: customerData.phone1 || null, type: sql.NVarChar(10) },
                { name: 'cmPhone2', value: customerData.phone2 || null, type: sql.NVarChar(10) },
                { name: 'cmEmail', value: customerData.email || null, type: sql.NVarChar(100) },
                { name: 'cmGender', value: customerData.gender || null, type: sql.NVarChar(1) },
                { name: 'cmDob', value: customerData.dob || null, type: sql.Date },
                { name: 'cmReference1', value: customerData.reference1 || null, type: sql.NVarChar(100) },
                { name: 'cmReference2', value: customerData.reference2 || null, type: sql.NVarChar(100) },
                { name: 'createdBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return await this.getCustomerByCode(customerData.customerCode);
        } catch (error) {
            console.error('Error in createCustomer:', error);
            throw error;
        }
    }

    // Update customer
    async updateCustomer(customerCode, customerData, currentUser) {
        try {
            console.log('Updating customer:', customerCode, 'with data:', JSON.stringify(customerData, null, 2));

            await executeStoredProcedure('sp_Customer_Update', [
                { name: 'cmCode', value: customerCode, type: sql.NVarChar(30) },
                { name: 'cmTitle', value: customerData.titleCode, type: sql.NVarChar(50) },
                { name: 'cmFName', value: customerData.firstName, type: sql.NVarChar(150) },
                { name: 'cmLName', value: customerData.lastName || null, type: sql.NVarChar(100) },
                { name: 'cmFullName', value: customerData.fullName, type: sql.NVarChar(150) },
                { name: 'cmGroup', value: customerData.groupCode, type: sql.NVarChar(5) },
                { name: 'cmNic', value: customerData.nic || null, type: sql.NVarChar(50) },
                { name: 'cmStatus', value: customerData.status !== undefined ? customerData.status : true, type: sql.Bit },
                { name: 'cmPhoto', value: null, type: sql.NVarChar(50) }, 
                { name: 'cmAdd1', value: customerData.address1 || null, type: sql.NVarChar(150) },
                { name: 'cmMobile1', value: customerData.mobile1 || null, type: sql.NVarChar(25) },
                { name: 'cmMobile2', value: customerData.mobile2 || null, type: sql.NVarChar(13) },
                { name: 'cmPhone1', value: customerData.phone1 || null, type: sql.NVarChar(10) },
                { name: 'cmPhone2', value: customerData.phone2 || null, type: sql.NVarChar(10) },
                { name: 'cmEmail', value: customerData.email || null, type: sql.NVarChar(100) },
                { name: 'cmGender', value: customerData.gender || null, type: sql.NVarChar(1) },
                { name: 'cmDob', value: customerData.dob || null, type: sql.Date },
                { name: 'cmReference1', value: customerData.reference1 || null, type: sql.NVarChar(100) },
                { name: 'cmReference2', value: customerData.reference2 || null, type: sql.NVarChar(100) },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return await this.getCustomerByCode(customerCode);
        } catch (error) {
            console.error('Error in updateCustomer:', error);
            throw error;
        }
    }

    // Update customer photo - FIXED VERSION
    async updateCustomerPhoto(customerCode, photoPath, currentUser) {
        try {
            console.log('Updating photo for customer:', customerCode, 'with path:', photoPath);
            
            // Ensure photoPath is not too long for NVARCHAR(50)
            if (photoPath && photoPath.length > 50) {
                console.warn('Photo path too long, truncating to 50 characters');
                photoPath = photoPath.substring(0, 50);
            }
            
            // Use stored procedure with correct data types
            await executeStoredProcedure('sp_Customer_UpdatePhoto', [
                { name: 'cmCode', value: customerCode, type: sql.NVarChar(30) },
                { name: 'cmPhoto', value: photoPath, type: sql.NVarChar(50) }, // CORRECTED: NVARCHAR(50)
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return { success: true, message: 'Photo updated successfully' };
        } catch (error) {
            console.error('Error updating customer photo:', error);
            throw error;
        }
    }

    async getNextCustomerCode() {
    try {
        const result = await executeStoredProcedure('sp_GetNextCustomerCode', []);
        console.log('SP result:', result);
        
        if (result.recordset && result.recordset.length > 0) {
            const nextCode = result.recordset[0].NextCustomerCode;
            console.log('Next code from SP:', nextCode);
            
            // Ensure we return a valid code
            if (nextCode && nextCode.length === 6) {
                return nextCode;
            }
        }
        
        // If no records or invalid response, start from 000001
        console.log('No records found, starting from 000001');
        return '000001';
    } catch (error) {
        console.error('Error getting next customer code:', error);
        return '000001';
    }
}

    // Get customer by code
    async getCustomerByCode(customerCode) {
        try {
            const result = await executeStoredProcedure('sp_Customer_GetByCode', [
                { name: 'cmCode', value: customerCode, type: sql.NVarChar(30) }
            ]);

            if (result.recordset.length === 0) {
                return null;
            }

            return new Customer(result.recordset[0]);
        } catch (error) {
            console.error('Error in getCustomerByCode:', error);
            throw error;
        }
    }

    // Search customers with pagination
    async searchCustomers(criteria) {
        try {
            const searchCriteria = new CustomerSearchCriteria(criteria);
            
            let statusValue = null;
            if (searchCriteria.status !== null) {
                statusValue = searchCriteria.status === true || 
                             searchCriteria.status === 'true' || 
                             searchCriteria.status === 1 || 
                             searchCriteria.status === '1';
            }

            const result = await executeStoredProcedure('sp_Customer_Search', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar(100) },
                { name: 'status', value: statusValue, type: sql.Bit },
                { name: 'groupCode', value: searchCriteria.groupCode, type: sql.NVarChar(5) },
                { name: 'page', value: searchCriteria.page, type: sql.Int },
                { name: 'pageSize', value: searchCriteria.pageSize, type: sql.Int },
                { name: 'sortBy', value: searchCriteria.sortBy, type: sql.NVarChar(50) },
                { name: 'sortOrder', value: searchCriteria.sortOrder, type: sql.NVarChar(4) }
            ]);

            const customers = result.recordset.map(row => new Customer(row));

            const countResult = await executeStoredProcedure('sp_Customer_Count', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar(100) },
                { name: 'status', value: statusValue, type: sql.Bit },
                { name: 'groupCode', value: searchCriteria.groupCode, type: sql.NVarChar(5) }
            ]);

            const total = countResult.recordset[0] ? countResult.recordset[0].TotalCount : 0;

            return {
                customers,
                pagination: {
                    page: searchCriteria.page,
                    pageSize: searchCriteria.pageSize,
                    total,
                    totalPages: Math.ceil(total / searchCriteria.pageSize)
                }
            };
        } catch (error) {
            console.error('Error in searchCustomers:', error);
            throw error;
        }
    }

    // Delete customer
    async deleteCustomer(customerCode, currentUser) {
        try {
            const result = await executeStoredProcedure('sp_Customer_Delete', [
                { name: 'cmCode', value: customerCode, type: sql.NVarChar(30) },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return result.recordset[0];
        } catch (error) {
            console.error('Error in deleteCustomer:', error);
            throw error;
        }
    }

    // Check duplicate customer code
    async checkDuplicateCustomerCode(customerCode, excludeCustomerCode = null) {
        try {
            const result = await executeStoredProcedure('sp_Customer_CheckDuplicate', [
                { name: 'cmCode', value: customerCode, type: sql.NVarChar(30) },
                { name: 'excludeCmCode', value: excludeCustomerCode, type: sql.NVarChar(30) }
            ]);
            
            return result.recordset[0].IsDuplicate === 1;
        } catch (error) {
            console.error('Error in checkDuplicateCustomerCode:', error);
            throw error;
        }
    }
}

module.exports = new CustomerService();