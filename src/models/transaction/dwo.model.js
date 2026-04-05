class DWOHeader {
    constructor(data) {
        this.type = data.type || data.HED_TYPE || 'DWO';
        this.runNo = data.runNo || data.HED_RUNNO || '';
        this.comCode = data.comCode || data.HED_COMCODE || '00001';
        this.setupLoc = data.setupLoc || data.HED_SETUPLOC || '00001';
        this.txnDate = data.txnDate || data.HED_TXNDATE || new Date().toISOString().split('T')[0];
        this.time = data.time || data.HED_TIME || new Date();
        this.procDate = data.procDate || data.HED_PROCDATE || null;
        this.logLocation = data.logLocation || data.HED_LOGLOCATION || '';
        this.locFrom = data.locFrom || data.HED_LOCFROM || '';
        this.locTo = data.locTo || data.HED_LOCTO || '';
        this.locDel = data.locDel || data.HED_LOCDEL || '';
        this.supCode = data.supCode || data.HED_SUPCODE || '';
        this.supName = data.supName || '';
        this.cusCode = data.cusCode || data.HED_CUSCODE || '';
        this.ref1 = data.ref1 || data.HED_REF1 || '';
        this.ref2 = data.ref2 || data.HED_REF2 || '';
        this.groAmt = data.groAmt || data.HED_GROAMT || 0;
        this.discPer = data.discPer || data.HED_DISCPER || 0;
        this.netAmt = data.netAmt || data.HED_NETAMT || 0;
        this.canUser = data.canUser || data.HED_CANUSER || '';
        this.processed = data.processed !== undefined ? data.processed : 
                        (data.HED_PROCESSED !== undefined ? data.HED_PROCESSED : false);
        this.cancelled = data.cancelled !== undefined ? data.cancelled : 
                        (data.HED_CANCELLED !== undefined ? data.HED_CANCELLED : false);
        this.fullyUsed = data.fullyUsed !== undefined ? data.fullyUsed : 
                        (data.HED_FULLYUSED !== undefined ? data.HED_FULLYUSED : false);
        this.refType = data.refType || data.HED_REFTYPE || '';
        this.refNo = data.refNo || data.HED_REFNO || '';
        this.createdDate = data.createdDate || data.CR_DATE || new Date();
        this.createdBy = data.createdBy || data.CR_BY || '';
        this.modifiedDate = data.modifiedDate || data.MD_DATE || null;
        this.modifiedBy = data.modifiedBy || data.MD_BY || null;
    }
}

class DWODetail {
    constructor(data) {
        this.lineNo = data.lineNo || data.DET_LINENO || 0;
        this.type = data.type || data.DET_TYPE || 'DWO';
        this.runNo = data.runNo || data.DET_RUNNO || '';
        this.comCode = data.comCode || data.DET_COMCODE || '00001';
        this.locFrom = data.locFrom || data.DET_LOCFROM || '';
        this.locTo = data.locTo || data.DET_LOCTO || '';
        this.saCode = data.saCode || data.DET_SACODE || '';
        this.proCode = data.proCode || data.DET_PROCODE || '';
        this.stockCode = data.stockCode || data.DET_STOCKCODE || '';
        this.proDesc = data.proDesc || data.DET_PRODESC || '';
        this.unit = data.unit || data.DET_UNIT || '';
        this.unitQty = data.unitQty || data.DET_UNITQTY || 0;
        this.sPrice = data.sPrice || data.DET_SPRICE || 0;
        this.cPrice = data.cPrice || data.DET_CPRICE || 0;
        this.discPer = data.discPer || data.DET_DISCPER || 0;
        this.discAmt = data.discAmt || data.DET_DISCAMT || 0;
        this.amount = data.amount || data.DET_AMOUNT || 0;
        this.createdDate = data.createdDate || data.CR_DATE || new Date();
        this.createdBy = data.createdBy || data.CR_BY || '';
        this.modifiedDate = data.modifiedDate || data.MD_DATE || null;
        this.modifiedBy = data.modifiedBy || data.MD_BY || null;
    }
}

class DWOSearchCriteria {
    constructor(criteria) {
        this.searchText = criteria.searchText || '';
        this.type = criteria.type || 'DWO';
        this.fromDate = criteria.fromDate || null;
        this.toDate = criteria.toDate || null;
        this.supCode = criteria.supCode || null;
        this.processed = criteria.processed !== undefined ? criteria.processed : null;
        this.page = parseInt(criteria.page) || 1;
        this.pageSize = parseInt(criteria.pageSize) || 20;
    }
}

module.exports = {
    DWOHeader,
    DWODetail,
    DWOSearchCriteria
};