const { executeStoredProcedure, sql } = require('../config/database');
const { Brand, BrandSearchCriteria } = require('../models/brand.model');

class BrandService {
    constructor() {}

    // Get all brands (for dropdown)
    async getAllBrands() {
        try {
            const result = await executeStoredProcedure('sp_Brand_GetAll', []);
            
            if (!result.recordset || result.recordset.length === 0) {
                return [];
            }

            return result.recordset.map(row => new Brand(row));
        } catch (error) {
            console.error('Error getting all brands:', error);
            throw new Error('Unable to fetch brands');
        }
    }

    // Get next brand code
    async getNextBrandCode() {
        try {
            const result = await executeStoredProcedure('sp_Brand_GetNextCode', []);
            
            if (result.recordset && result.recordset.length > 0) {
                return result.recordset[0].NextBrandCode;
            }
            
            return '0001';
        } catch (error) {
            console.error('Error getting next brand code:', error);
            return '0001';
        }
    }

    // Create brand
    async createBrand(brandData, currentUser) {
        try {
            // Check if brand code already exists
            const existing = await this.getBrandByCode(brandData.brandCode);
            if (existing) {
                throw new Error(`Brand code '${brandData.brandCode}' already exists`);
            }

            await executeStoredProcedure('sp_Brand_Create', [
                { name: 'gpCode', value: brandData.brandCode, type: sql.NVarChar(4) },
                { name: 'gpDesc', value: brandData.description, type: sql.NVarChar(50) },
                { name: 'gpStatus', value: brandData.status !== undefined ? brandData.status : true, type: sql.Bit },
                { name: 'createdBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return await this.getBrandByCode(brandData.brandCode);
        } catch (error) {
            throw error;
        }
    }

    // Update brand
    async updateBrand(brandCode, brandData, currentUser) {
        try {
            await executeStoredProcedure('sp_Brand_Update', [
                { name: 'gpCode', value: brandCode, type: sql.NVarChar(4) },
                { name: 'gpDesc', value: brandData.description, type: sql.NVarChar(50) },
                { name: 'gpStatus', value: brandData.status !== undefined ? brandData.status : true, type: sql.Bit },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return await this.getBrandByCode(brandCode);
        } catch (error) {
            throw error;
        }
    }

    // Get brand by code
    async getBrandByCode(brandCode) {
        try {
            const result = await executeStoredProcedure('sp_Brand_GetByCode', [
                { name: 'gpCode', value: brandCode, type: sql.NVarChar(4) }
            ]);

            if (result.recordset.length === 0) {
                return null;
            }

            return new Brand(result.recordset[0]);
        } catch (error) {
            throw error;
        }
    }

    // Search brands with pagination
    async searchBrands(criteria) {
        try {
            const searchCriteria = new BrandSearchCriteria(criteria);
            
            let statusValue = null;
            if (searchCriteria.status !== null) {
                statusValue = searchCriteria.status === true || 
                             searchCriteria.status === 'true' || 
                             searchCriteria.status === 1 || 
                             searchCriteria.status === '1';
            }

            const result = await executeStoredProcedure('sp_Brand_Search', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar(100) },
                { name: 'status', value: statusValue, type: sql.Bit },
                { name: 'page', value: searchCriteria.page, type: sql.Int },
                { name: 'pageSize', value: searchCriteria.pageSize, type: sql.Int },
                { name: 'sortBy', value: searchCriteria.sortBy, type: sql.NVarChar(50) },
                { name: 'sortOrder', value: searchCriteria.sortOrder, type: sql.NVarChar(4) }
            ]);

            const brands = result.recordset.map(row => new Brand(row));

            const countResult = await executeStoredProcedure('sp_Brand_Count', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar(100) },
                { name: 'status', value: statusValue, type: sql.Bit }
            ]);

            const total = countResult.recordset[0] ? countResult.recordset[0].TotalCount : 0;

            return {
                brands,
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

    // Delete brand
    async deleteBrand(brandCode, currentUser) {
        try {
            const result = await executeStoredProcedure('sp_Brand_Delete', [
                { name: 'gpCode', value: brandCode, type: sql.NVarChar(4) },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    // Check duplicate brand code
    async checkDuplicateBrandCode(brandCode, excludeBrandCode = null) {
        try {
            const result = await executeStoredProcedure('sp_Brand_CheckDuplicate', [
                { name: 'gpCode', value: brandCode, type: sql.NVarChar(4) },
                { name: 'excludeGpCode', value: excludeBrandCode, type: sql.NVarChar(4) }
            ]);
            
            return result.recordset[0].IsDuplicate === 1;
        } catch (error) {
            throw error; 
        }
    }
}

module.exports = new BrandService();