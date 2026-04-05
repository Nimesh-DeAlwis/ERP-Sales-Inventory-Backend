const { executeStoredProcedure, sql } = require('../config/database');
const { Title, TitleSearchCriteria } = require('../models/title.model');

class TitleService {
    constructor() {}

    // Create new title
    async createTitle(titleData, currentUser) {
        try {
            // Check if title code already exists
            const existing = await this.getTitleById(titleData.titleCode);
            if (existing) {
                throw new Error(`Title code '${titleData.titleCode}' already exists`);
            }

            // Create title
            const result = await executeStoredProcedure('sp_Title_Create', [
                { name: 'titleCode', value: titleData.titleCode, type: sql.NVarChar },
                { name: 'description', value: titleData.description, type: sql.NVarChar },
                { name: 'status', value: titleData.status !== undefined ? titleData.status : true, type: sql.Bit },
                { name: 'createdBy', value: currentUser, type: sql.NVarChar }
            ]);

            return new Title(result.recordset[0]);
        } catch (error) {
            throw error;
        }
    }

    // Update title
    async updateTitle(titleCode, titleData, currentUser) {
        try {
            // Update title
            const result = await executeStoredProcedure('sp_Title_Update', [
                { name: 'titleCode', value: titleCode, type: sql.NVarChar },
                { name: 'description', value: titleData.description, type: sql.NVarChar },
                { name: 'status', value: titleData.status !== undefined ? titleData.status : true, type: sql.Bit },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar }
            ]);

            return new Title(result.recordset[0]);
        } catch (error) {
            throw error;
        }
    }

    // Get title by ID
    async getTitleById(titleCode) {
        try {
            const result = await executeStoredProcedure('sp_Title_GetById', [
                { name: 'titleCode', value: titleCode, type: sql.NVarChar }
            ]);

            if (result.recordset.length === 0) {
                return null;
            }

            return new Title(result.recordset[0]);
        } catch (error) {
            throw error;
        }
    }

    // Get all active titles
    async getAllActiveTitles() {
        try {
            const result = await executeStoredProcedure('sp_Title_GetAllActive');

            return result.recordset.map(row => new Title(row));
        } catch (error) {
            throw error;
        }
    }

    // Get all titles (with pagination)
    async getAllTitles(criteria = {}) {
        try {
            const searchCriteria = new TitleSearchCriteria(criteria);
            
            let statusValue = null;
            if (searchCriteria.status !== null) {
                statusValue = searchCriteria.status === true || 
                              searchCriteria.status === 'true' || 
                              searchCriteria.status === 1 || 
                              searchCriteria.status === '1';
            }

            const result = await executeStoredProcedure('sp_Title_GetAll', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar },
                { name: 'status', value: statusValue, type: sql.Bit },
                { name: 'page', value: searchCriteria.page, type: sql.Int },
                { name: 'pageSize', value: searchCriteria.pageSize, type: sql.Int },
                { name: 'sortBy', value: searchCriteria.sortBy, type: sql.NVarChar },
                { name: 'sortOrder', value: searchCriteria.sortOrder, type: sql.NVarChar }
            ]);

            const titles = result.recordset.map(row => new Title(row));

            // Get total count
            const countResult = await executeStoredProcedure('sp_Title_Count', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar },
                { name: 'status', value: statusValue, type: sql.Bit }
            ]);

            const total = countResult.recordset[0] ? countResult.recordset[0].TotalCount : 0;

            return {
                titles,
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

   // Get titles for dropdown
async getTitlesForDropdown() {
    try {
        const result = await executeStoredProcedure('sp_Title_GetForDropdown');
        
        console.log('Raw stored procedure result:', result.recordset);
        
        // Map the result based on actual column names
        return result.recordset.map(row => {
            console.log('Row keys:', Object.keys(row));
            
            return {
                titleCode: row.TT_CODE || row.Code || row.code || row.ID || row.id || '',
                description: row.TT_DESC || row.Description || row.description || row.Name || row.name || '',
                status: row.TT_STATUS || row.Status || row.status || true
            };
        });
    } catch (error) {
        console.error('Error in getTitlesForDropdown:', error);
        throw error;
    }
}

    // Delete title (soft delete - set inactive)
    async deleteTitle(titleCode, currentUser) {
        try {
            // Check if title is being used
            const isUsed = await this.checkTitleUsage(titleCode);
            if (isUsed) {
                throw new Error(`Cannot delete title '${titleCode}' as it is being used in the system`);
            }

            const result = await executeStoredProcedure('sp_Title_Delete', [
                { name: 'titleCode', value: titleCode, type: sql.NVarChar },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar }
            ]);

            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    // Check if title code already exists
    async checkDuplicateTitleCode(titleCode, excludeTitleCode = null) {
        try {
            const result = await executeStoredProcedure('sp_Title_CheckDuplicate', [
                { name: 'titleCode', value: titleCode, type: sql.NVarChar },
                { name: 'excludeTitleCode', value: excludeTitleCode, type: sql.NVarChar }
            ]);

            return result.recordset[0].IsDuplicate === 1;
        } catch (error) {
            throw error;
        }
    }

    // Check if title is being used in the system
    async checkTitleUsage(titleCode) {
        try {
            const result = await executeStoredProcedure('sp_Title_CheckUsage', [
                { name: 'titleCode', value: titleCode, type: sql.NVarChar }
            ]);

            return result.recordset[0].IsUsed === 1;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new TitleService();