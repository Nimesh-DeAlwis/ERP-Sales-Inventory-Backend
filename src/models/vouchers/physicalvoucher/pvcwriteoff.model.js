class PVCWriteOffHeader {
    constructor(data) {
        this.HED_TYPE = data.HED_TYPE;
        this.HED_RUNNO = data.HED_RUNNO;
        this.HED_TXNDATE = data.HED_TXNDATE;
        this.HED_TIME = data.HED_TIME;
        this.HED_LOC = data.HED_LOC;
        this.HED_REASON = data.HED_REASON;
        this.HED_REMARKS = data.HED_REMARKS;
        this.HED_TOTALVOUCHERS = data.HED_TOTALVOUCHERS || 0;
        this.HED_TOTALVALUE = data.HED_TOTALVALUE || 0;
        this.HED_PROCESSED = data.HED_PROCESSED || 0;
        this.HED_CANCELLED = data.HED_CANCELLED || 0;
        this.CR_DATE = data.CR_DATE || new Date();
        this.CR_BY = data.CR_BY;
    }

    static validate(data) {
        const errors = [];
        if (!data.HED_LOC) errors.push('Location is required');
        if (!data.HED_TXNDATE) errors.push('Transaction date is required');
        if (!data.HED_REASON) errors.push('Write off reason is required');
        return { isValid: errors.length === 0, errors };
    }
}

class PVCWriteOffDetail {
    constructor(data) {
        this.DET_TYPE = data.DET_TYPE;
        this.DET_RUNNO = data.DET_RUNNO;
        this.DET_LINENO = data.DET_LINENO;
        this.DET_VC_NUMBER = data.DET_VC_NUMBER;
        this.DET_VC_VALUE = data.DET_VC_VALUE || 0;
        this.DET_VC_LOC = data.DET_VC_LOC;
        this.DET_VC_GROUP = data.DET_VC_GROUP;
        this.DET_VC_BOOKNO = data.DET_VC_BOOKNO;
        this.DET_REASON = data.DET_REASON;
        this.CR_DATE = data.CR_DATE || new Date();
        this.CR_BY = data.CR_BY;
    }
}

module.exports = { PVCWriteOffHeader, PVCWriteOffDetail };