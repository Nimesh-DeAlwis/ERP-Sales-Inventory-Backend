class Unit {
    constructor(unitData) {
        this.unitCode = unitData.unitCode || unitData.UM_CODE || '';
        this.description = unitData.description || unitData.UM_DESC || '';
        this.status = unitData.status !== undefined ? unitData.status : 
                     (unitData.UM_STATUS !== undefined ? unitData.UM_STATUS : true);
        this.volume = unitData.volume || unitData.UM_VOLUME || 0;
        this.refCode = unitData.refCode || unitData.UM_REFCODE || '';
        this.createdDate = unitData.createdDate || unitData.CR_DATE || new Date();
        this.createdBy = unitData.createdBy || unitData.CR_BY || '';
        this.modifiedDate = unitData.modifiedDate || unitData.MD_DATE || null;
        this.modifiedBy = unitData.modifiedBy || unitData.MD_BY || null;
    }
}

class UnitSearchCriteria {
    constructor(criteria) {
        this.searchText = criteria.searchText || '';
        this.status = criteria.status !== undefined ? criteria.status : null;
        this.page = parseInt(criteria.page) || 1;
        this.pageSize = parseInt(criteria.pageSize) || 20;
        this.sortBy = criteria.sortBy || 'UM_CODE';
        this.sortOrder = criteria.sortOrder || 'ASC';
    }
}

module.exports = {
    Unit,
    UnitSearchCriteria
};