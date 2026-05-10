class PVCPOHeader {
    constructor(data) {
        this.type = data.type || data.HED_TYPE || 'PVP';
        this.runNo = data.runNo || data.HED_RUNNO || '';
        this.txnDate = data.txnDate || data.HED_TXNDATE || new Date().toISOString().split('T')[0];
        this.time = data.time || data.HED_TIME || new Date();
        this.loc = data.loc || data.HED_LOC || '';
        this.supCode = data.supCode || data.HED_SUPCODE || '';
        this.supName = data.supName || '';
        this.ref1 = data.ref1 || data.HED_REF1 || '';
        this.netAmt = data.netAmt || data.HED_NETAMT || 0;
        this.processed = data.processed !== undefined ? data.processed : (data.HED_PROCESSED || 0);
        this.cancelled = data.cancelled !== undefined ? data.cancelled : (data.HED_CANCELLED || 0);
        this.canDate = data.canDate || data.HED_CANDATE || null;
        this.canUser = data.canUser || data.HED_CANUSER || '';
        this.createdDate = data.createdDate || data.CR_DATE || new Date();
        this.createdBy = data.createdBy || data.CR_BY || '';
        this.modifiedDate = data.modifiedDate || data.MD_DATE || null;
        this.modifiedBy = data.modifiedBy || data.MD_BY || null;
    }
}

class PVCPODetail {
    constructor(data) {
        this.type = data.type || data.DET_TYPE || 'PVP';
        this.runNo = data.runNo || data.DET_RUNNO || '';
        this.sPrice = data.sPrice || data.DET_SPRICE || 0;
        this.cPrice = data.cPrice || data.DET_CPRICE || 0;
        this.vcbStart = data.vcbStart || data.DET_VCBSTART || 0;
        this.vcbQty = data.vcbQty || data.DET_VCBQTY || 0;
        this.vcbEnd = data.vcbEnd || data.DET_VCBEND || 0;
        this.sValue = data.sValue || data.DET_SVALUE || 0;
        this.cValue = data.cValue || data.DET_CVALUE || 0;
        this.createdDate = data.createdDate || data.CR_DATE || new Date();
        this.createdBy = data.createdBy || data.CR_BY || '';
        this.modifiedDate = data.modifiedDate || data.MD_DATE || null;
        this.modifiedBy = data.modifiedBy || data.MD_BY || null;
    }
}

class PVCPOSearchCriteria {
    constructor(criteria) {
        this.searchText = criteria.searchText || '';
        this.type = criteria.type || 'PVP';
        this.fromDate = criteria.fromDate || null;
        this.toDate = criteria.toDate || null;
        this.supCode = criteria.supCode || null;
        this.processed = criteria.processed !== undefined ? criteria.processed : null;
        this.cancelled = criteria.cancelled !== undefined ? criteria.cancelled : null;
        this.page = parseInt(criteria.page) || 1;
        this.pageSize = parseInt(criteria.pageSize) || 20;
    }
}

module.exports = {
    PVCPOHeader,
    PVCPODetail,
    PVCPOSearchCriteria
};