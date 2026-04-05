class Title {
    constructor(titleData) {
        this.titleCode = titleData.TT_CODE || '';
        this.description = titleData.TT_DESC || '';
        this.status = titleData.TT_STATUS !== undefined ? titleData.TT_STATUS : true;
        this.createdDate = titleData.CR_DATE || new Date();
        this.createdBy = titleData.CR_BY || '';
        this.modifiedDate = titleData.MD_DATE || null;
        this.modifiedBy = titleData.MD_BY || null;
    }
}

class TitleSearchCriteria {
    constructor(criteria) {
        this.searchText = criteria.searchText || '';
        this.status = criteria.status !== undefined ? criteria.status : null;
        this.page = criteria.page || 1;
        this.pageSize = criteria.pageSize || 20;
        this.sortBy = criteria.sortBy || 'TT_CODE';
        this.sortOrder = criteria.sortOrder || 'ASC';
    }
}

module.exports = {
    Title,
    TitleSearchCriteria
};