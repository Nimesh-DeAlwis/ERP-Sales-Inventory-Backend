class PayModeHeader {
    constructor(data) {
        this.phCode = data.phCode || data.PH_CODE || '';
        this.description = data.description || data.PH_DESC || '';
        this.status = data.status !== undefined ? data.status : 
                     (data.PH_STATUS !== undefined ? data.PH_STATUS : 1);
        this.hasDetails = data.hasDetails !== undefined ? data.hasDetails : 
                         (data.PH_DETAILS !== undefined ? data.PH_DETAILS : 0);
        this.createdDate = data.createdDate || data.CR_DATE || new Date();
        this.createdBy = data.createdBy || data.CR_BY || '';
        this.modifiedDate = data.modifiedDate || data.MD_DATE || null;
        this.modifiedBy = data.modifiedBy || data.MD_BY || null;
    }
}

class PayModeDetail {
    constructor(data) {
        this.phCode = data.phCode || data.PD_PHCODE || '';
        this.detailCode = data.detailCode || data.PD_CODE || '';
        this.description = data.description || data.PD_DESC || '';
        this.format = data.format || data.PD_FORMAT || '';
        this.createdDate = data.createdDate || data.CR_DATE || new Date();
        this.createdBy = data.createdBy || data.CR_BY || '';
        this.modifiedDate = data.modifiedDate || data.MD_DATE || null;
        this.modifiedBy = data.modifiedBy || data.MD_BY || null;
    }
}

class PayModeHeaderWithDetails {
    constructor(header, details = []) {
        this.phCode = header.phCode;
        this.description = header.description;
        this.status = header.status;
        this.hasDetails = header.hasDetails;
        this.details = details;
        this.createdDate = header.createdDate;
        this.createdBy = header.createdBy;
    }
}

class PayModeSearchCriteria {
    constructor(criteria) {
        this.searchText = criteria.searchText || '';
        this.status = criteria.status !== undefined ? criteria.status : null;
        this.hasDetails = criteria.hasDetails !== undefined ? criteria.hasDetails : null;
        this.page = parseInt(criteria.page) || 1;
        this.pageSize = parseInt(criteria.pageSize) || 20;
        this.sortBy = criteria.sortBy || 'PH_CODE';
        this.sortOrder = criteria.sortOrder || 'ASC';
    }
}

module.exports = {
    PayModeHeader,
    PayModeDetail,
    PayModeHeaderWithDetails,
    PayModeSearchCriteria
};