// src/models/customergroup.model.js
class CustomerGroup {
    constructor(data) {
        this.groupCode = data.groupCode || data.CG_CODE || '';
        this.description = data.description || data.CG_DESC || '';
        this.status = data.status !== undefined ? data.status : 
                     (data.CG_STATUS !== undefined ? data.CG_STATUS : true);
        this.createdDate = data.createdDate || data.CR_DATE || new Date();
        this.createdBy = data.createdBy || data.CR_BY || '';
        this.modifiedDate = data.modifiedDate || data.MD_DATE || null;
        this.modifiedBy = data.modifiedBy || data.MD_BY || null;
    }
}

class CustomerGroupSearchCriteria {
    constructor(criteria) {
        this.searchText = criteria.searchText || '';
        this.status = criteria.status !== undefined ? criteria.status : null;
        this.page = parseInt(criteria.page) || 1;
        this.pageSize = parseInt(criteria.pageSize) || 20;
        this.sortBy = criteria.sortBy || 'CG_CODE';
        this.sortOrder = criteria.sortOrder || 'ASC';
    }
}

module.exports = {
    CustomerGroup,
    CustomerGroupSearchCriteria
};