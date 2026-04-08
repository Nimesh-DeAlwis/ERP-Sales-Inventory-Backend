class PVGroup {
    constructor(data) {
        this.code = data.code || data.VCG_CODE || '';
        this.description = data.description || data.VCG_DESC || '';
        this.status = data.status !== undefined ? data.status : (data.VCG_STATUS !== undefined ? data.VCG_STATUS : true);
        this.value = data.value || data.VCG_VALUE || 0;
        this.expDays = data.expDays || data.VCG_EXPDAYS || 0;
        this.cost = data.cost || data.VCG_COST || 0;
        this.bookQty = data.bookQty || data.VCG_BOOKQTY || 0;
        this.bookNo = data.bookNo || data.VCG_BOOKNO || 0;
        this.createdDate = data.createdDate || data.CR_DATE || new Date();
        this.createdBy = data.createdBy || data.CR_BY || '';
        this.modifiedDate = data.modifiedDate || data.MD_DATE || null;
        this.modifiedBy = data.modifiedBy || data.MD_BY || null;
    }
}

class PVGroupSearchCriteria {
    constructor(criteria) {
        this.searchText = criteria.searchText || '';
        this.status = criteria.status !== undefined ? criteria.status : null;
        this.page = parseInt(criteria.page) || 1;
        this.pageSize = parseInt(criteria.pageSize) || 20;
    }
}

module.exports = {
    PVGroup,
    PVGroupSearchCriteria
};