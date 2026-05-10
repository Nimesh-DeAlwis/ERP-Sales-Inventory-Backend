class EVGroup {
    constructor(data) {
        this.code = data.code || data.EVCG_CODE || '';
        this.description = data.description || data.EVCG_DESC || '';
        this.status = data.status !== undefined ? data.status : (data.EVCG_STATUS !== undefined ? data.EVCG_STATUS : true);
        this.value = data.value || data.EVCG_VALUE || 0;
        this.expDays = data.expDays || data.EVCG_EXPDAYS || 0;
        this.createdDate = data.createdDate || data.CR_DATE || new Date();
        this.createdBy = data.createdBy || data.CR_BY || '';
        this.modifiedDate = data.modifiedDate || data.MD_DATE || null;
        this.modifiedBy = data.modifiedBy || data.MD_BY || null;
    }
}

class EVGroupSearchCriteria {
    constructor(criteria) {
        this.searchText = criteria.searchText || '';
        this.status = criteria.status !== undefined ? criteria.status : null;
        this.page = parseInt(criteria.page) || 1;
        this.pageSize = parseInt(criteria.pageSize) || 20;
    }
}

module.exports = {
    EVGroup,
    EVGroupSearchCriteria
};