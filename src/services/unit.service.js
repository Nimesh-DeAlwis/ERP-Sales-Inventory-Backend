const { executeStoredProcedure, sql } = require('../config/database');
const { Unit, UnitSearchCriteria } = require('../models/unit.model');

class UnitService {
    constructor() {}

    // Get all units (for dropdown)
    async getAllUnits() {
        try {
            const result = await executeStoredProcedure('sp_Unit_GetAll', []);
            
            if (!result.recordset || result.recordset.length === 0) {
                return [];
            }

            return result.recordset.map(row => new Unit(row));
        } catch (error) {
            console.error('Error getting all units:', error);
            throw new Error('Unable to fetch units');
        }
    }

    // Create unit
    async createUnit(unitData, currentUser) {
        try {
            // Check if unit code already exists
            const existing = await this.getUnitByCode(unitData.unitCode);
            if (existing) {
                throw new Error(`Unit code '${unitData.unitCode}' already exists`);
            }

            await executeStoredProcedure('sp_Unit_Create', [
                { name: 'unitCode', value: unitData.unitCode, type: sql.NVarChar },
                { name: 'description', value: unitData.description, type: sql.NVarChar },
                { name: 'status', value: unitData.status !== undefined ? unitData.status : true, type: sql.Bit },
                { name: 'volume', value: unitData.volume || 0, type: sql.Numeric },
                { name: 'refCode', value: unitData.refCode || null, type: sql.NVarChar },
                { name: 'createdBy', value: currentUser, type: sql.NVarChar }
            ]);

            return await this.getUnitByCode(unitData.unitCode);
        } catch (error) {
            throw error;
        }
    }

    // Update unit
    async updateUnit(unitCode, unitData, currentUser) {
        try {
            await executeStoredProcedure('sp_Unit_Update', [
                { name: 'unitCode', value: unitCode, type: sql.NVarChar },
                { name: 'description', value: unitData.description, type: sql.NVarChar },
                { name: 'status', value: unitData.status !== undefined ? unitData.status : true, type: sql.Bit },
                { name: 'volume', value: unitData.volume || 0, type: sql.Numeric },
                { name: 'refCode', value: unitData.refCode || null, type: sql.NVarChar },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar }
            ]);

            return await this.getUnitByCode(unitCode);
        } catch (error) {
            throw error;
        }
    }

    // Get unit by code
    async getUnitByCode(unitCode) {
        try {
            const result = await executeStoredProcedure('sp_Unit_GetByCode', [
                { name: 'unitCode', value: unitCode, type: sql.NVarChar }
            ]);

            if (result.recordset.length === 0) {
                return null;
            }

            return new Unit(result.recordset[0]);
        } catch (error) {
            throw error;
        }
    }

    // Search units with pagination
    async searchUnits(criteria) {
    try {
        const searchCriteria = new UnitSearchCriteria(criteria);
        console.log('Search criteria object:', searchCriteria);
        
        let statusValue = null;
        if (searchCriteria.status !== null) {
            statusValue = searchCriteria.status === true || 
                         searchCriteria.status === 'true' || 
                         searchCriteria.status === 1 || 
                         searchCriteria.status === '1';
        }

        console.log('Executing sp_Unit_Search with params:', {
            searchText: searchCriteria.searchText,
            status: statusValue,
            page: searchCriteria.page,
            pageSize: searchCriteria.pageSize,
            sortBy: searchCriteria.sortBy,
            sortOrder: searchCriteria.sortOrder
        });

        const result = await executeStoredProcedure('sp_Unit_Search', [
            { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar },
            { name: 'status', value: statusValue, type: sql.Bit },
            { name: 'page', value: searchCriteria.page, type: sql.Int },
            { name: 'pageSize', value: searchCriteria.pageSize, type: sql.Int },
            { name: 'sortBy', value: searchCriteria.sortBy, type: sql.NVarChar },
            { name: 'sortOrder', value: searchCriteria.sortOrder, type: sql.NVarChar }
        ]);

        console.log('Search result recordset length:', result.recordset?.length);

        const units = result.recordset.map(row => new Unit(row));

        // Get total count
        const countResult = await executeStoredProcedure('sp_Unit_Count', [
            { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar },
            { name: 'status', value: statusValue, type: sql.Bit }
        ]);

        const total = countResult.recordset[0] ? countResult.recordset[0].TotalCount : 0;

        return {
            units,
            pagination: {
                page: searchCriteria.page,
                pageSize: searchCriteria.pageSize,
                total,
                totalPages: Math.ceil(total / searchCriteria.pageSize)
            }
        };
    } catch (error) {
        console.error('Error in searchUnits:', error);
        throw error;
    }
}

    // Delete unit
    async deleteUnit(unitCode, currentUser) {
        try {
            const result = await executeStoredProcedure('sp_Unit_Delete', [
                { name: 'unitCode', value: unitCode, type: sql.NVarChar },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar }
            ]);

            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    // Check duplicate unit code
    async checkDuplicateUnitCode(unitCode, excludeUnitCode = null) {
        try {
            const result = await executeStoredProcedure('sp_Unit_CheckDuplicate', [
                { name: 'unitCode', value: unitCode, type: sql.NVarChar },
                { name: 'excludeUnitCode', value: excludeUnitCode, type: sql.NVarChar }
            ]);
            
            return result.recordset[0].IsDuplicate === 1;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new UnitService();