const { executeStoredProcedure, sql } = require('../config/database');
const { 
    PayModeHeader, 
    PayModeDetail, 
    PayModeHeaderWithDetails,
    PayModeSearchCriteria 
} = require('../models/paymode.model');

class PayModeService {
    constructor() {}

    // Get all payment mode headers (for dropdown)
    async getAllPayModes() {
        try {
            const result = await executeStoredProcedure('sp_PayModeHead_GetAll', []);
            
            if (!result.recordset || result.recordset.length === 0) {
                return [];
            }

            return result.recordset.map(row => new PayModeHeader(row));
        } catch (error) {
            console.error('Error getting all payment modes:', error);
            throw new Error('Unable to fetch payment modes');
        }
    }

    // Create payment mode header with details
    async createPayMode(headerData, details, currentUser) {
        try {
            // Check if code already exists
            const existing = await this.getPayModeByCode(headerData.phCode);
            if (existing) {
                throw new Error(`Payment mode code '${headerData.phCode}' already exists`);
            }

            // Create header
            await executeStoredProcedure('sp_PayModeHead_Create', [
                { name: 'phCode', value: headerData.phCode, type: sql.NVarChar },
                { name: 'phDesc', value: headerData.description, type: sql.NVarChar },
                { name: 'phStatus', value: headerData.status !== undefined ? headerData.status : 1, type: sql.Int },
                { name: 'phDetails', value: headerData.hasDetails || 0, type: sql.Int },
                { name: 'createdBy', value: currentUser, type: sql.NVarChar }
            ]);

            // Add details if provided and hasDetails = 1
            if (headerData.hasDetails === 1 && details && Array.isArray(details) && details.length > 0) {
                await this.addPayModeDetails(headerData.phCode, details, currentUser);
            }

            return await this.getPayModeWithDetails(headerData.phCode);
        } catch (error) {
            throw error;
        }
    }

    // Update payment mode header with details
    async updatePayMode(phCode, headerData, details, currentUser) {
        try {
            // Update header
            await executeStoredProcedure('sp_PayModeHead_Update', [
                { name: 'phCode', value: phCode, type: sql.NVarChar },
                { name: 'phDesc', value: headerData.description, type: sql.NVarChar },
                { name: 'phStatus', value: headerData.status !== undefined ? headerData.status : 1, type: sql.Int },
                { name: 'phDetails', value: headerData.hasDetails || 0, type: sql.Int },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar }
            ]);

            // Update details if provided
            if (details && Array.isArray(details)) {
                // First delete existing details
                await executeStoredProcedure('sp_PayModeDet_DeleteByHeader', [
                    { name: 'phCode', value: phCode, type: sql.NVarChar }
                ]);

                // Add new details if hasDetails = 1 and details exist
                if (headerData.hasDetails === 1 && details.length > 0) {
                    await this.addPayModeDetails(phCode, details, currentUser);
                }
            }

            return await this.getPayModeWithDetails(phCode);
        } catch (error) {
            throw error;
        }
    }

    // Add payment mode details
    async addPayModeDetails(phCode, details, currentUser) {
        try {
            for (const detail of details) {
                await executeStoredProcedure('sp_PayModeDet_Create', [
                    { name: 'phCode', value: phCode, type: sql.NVarChar },
                    { name: 'detailCode', value: detail.detailCode, type: sql.NVarChar },
                    { name: 'description', value: detail.description, type: sql.NVarChar },
                    { name: 'format', value: detail.format || null, type: sql.NVarChar },
                    { name: 'createdBy', value: currentUser, type: sql.NVarChar }
                ]);
            }
            return { message: 'Details added successfully' };
        } catch (error) {
            throw error;
        }
    }

    // Get payment mode by code
    async getPayModeByCode(phCode) {
        try {
            const result = await executeStoredProcedure('sp_PayModeHead_GetByCode', [
                { name: 'phCode', value: phCode, type: sql.NVarChar }
            ]);

            if (result.recordset.length === 0) {
                return null;
            }

            return new PayModeHeader(result.recordset[0]);
        } catch (error) {
            throw error;
        }
    }

    // Get payment mode with details
    async getPayModeWithDetails(phCode) {
        try {
            const result = await executeStoredProcedure('sp_PayModeHead_GetWithDetails', [
                { name: 'phCode', value: phCode, type: sql.NVarChar }
            ]);

            if (!result.recordsets || result.recordsets[0].length === 0) {
                throw new Error(`Payment mode '${phCode}' not found`);
            }

            const header = new PayModeHeader(result.recordsets[0][0]);
            
            let details = [];
            if (result.recordsets[1] && result.recordsets[1].length > 0) {
                details = result.recordsets[1].map(row => new PayModeDetail(row));
            }

            return new PayModeHeaderWithDetails(header, details);
        } catch (error) {
            throw error;
        }
    }

    // Search payment modes with pagination
    async searchPayModes(criteria) {
        try {
            const searchCriteria = new PayModeSearchCriteria(criteria);
            
            const result = await executeStoredProcedure('sp_PayModeHead_Search', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar },
                { name: 'status', value: searchCriteria.status, type: sql.Int },
                { name: 'hasDetails', value: searchCriteria.hasDetails, type: sql.Int },
                { name: 'page', value: searchCriteria.page, type: sql.Int },
                { name: 'pageSize', value: searchCriteria.pageSize, type: sql.Int },
                { name: 'sortBy', value: searchCriteria.sortBy, type: sql.NVarChar },
                { name: 'sortOrder', value: searchCriteria.sortOrder, type: sql.NVarChar }
            ]);

            const payModes = result.recordset.map(row => new PayModeHeader(row));

            // Get total count
            const countResult = await executeStoredProcedure('sp_PayModeHead_Count', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar },
                { name: 'status', value: searchCriteria.status, type: sql.Int },
                { name: 'hasDetails', value: searchCriteria.hasDetails, type: sql.Int }
            ]);

            const total = countResult.recordset[0] ? countResult.recordset[0].TotalCount : 0;

            return {
                payModes,
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

    // Delete payment mode
    async deletePayMode(phCode, currentUser) {
        try {
            const result = await executeStoredProcedure('sp_PayModeHead_Delete', [
                { name: 'phCode', value: phCode, type: sql.NVarChar },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar }
            ]);

            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    // Check duplicate payment mode code
    async checkDuplicatePayModeCode(phCode, excludePhCode = null) {
        try {
            const result = await executeStoredProcedure('sp_PayModeHead_CheckDuplicate', [
                { name: 'phCode', value: phCode, type: sql.NVarChar },
                { name: 'excludePhCode', value: excludePhCode, type: sql.NVarChar }
            ]);
            
            return result.recordset[0].IsDuplicate === 1;
        } catch (error) {
            throw error;
        }
    }

    // Get details by header code
    async getPayModeDetails(phCode) {
        try {
            const result = await executeStoredProcedure('sp_PayModeDet_GetByHeader', [
                { name: 'phCode', value: phCode, type: sql.NVarChar }
            ]);

            return result.recordset.map(row => new PayModeDetail(row));
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new PayModeService();