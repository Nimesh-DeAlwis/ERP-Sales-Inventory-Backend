class PVCGRNHeader {
    constructor(data) {
        this.HED_TYPE = data.HED_TYPE;
        this.HED_RUNNO = data.HED_RUNNO;
        this.HED_TXNDATE = data.HED_TXNDATE;
        this.HED_TIME = data.HED_TIME;
        this.HED_LOC = data.HED_LOC;
        this.HED_SUPCODE = data.HED_SUPCODE;
        this.HED_REFNO = data.HED_REFNO;
        this.HED_REF1 = data.HED_REF1;
        this.HED_REF2 = data.HED_REF2;
        this.HED_NETAMT = data.HED_NETAMT || 0;
        this.HED_PROCESSED = data.HED_PROCESSED || 0;
        this.HED_CANCELLED = data.HED_CANCELLED || 0;
        this.HED_CANDATE = data.HED_CANDATE;
        this.HED_CANUSER = data.HED_CANUSER;
        this.CR_DATE = data.CR_DATE || new Date();
        this.CR_BY = data.CR_BY;
        this.MD_DATE = data.MD_DATE;
        this.MD_BY = data.MD_BY;
    }

    static validate(data) {
        const errors = [];
        if (!data.HED_LOC) errors.push('Location is required');
        if (!data.HED_TXNDATE) errors.push('Transaction date is required');
        return { isValid: errors.length === 0, errors };
    }
}

class PVCGRNDetail {
    constructor(data) {
        this.DET_TYPE = data.DET_TYPE;
        this.DET_RUNNO = data.DET_RUNNO;
        this.DET_SETUPLOC = data.DET_SETUPLOC;
        this.DET_SPRICE = data.DET_SPRICE || 0;
        this.DET_CPRICE = data.DET_CPRICE || 0;
        this.DET_VCBSTART = data.DET_VCBSTART || 0;
        this.DET_VCBQTY = data.DET_VCBQTY || 0;
        this.DET_VCBEND = data.DET_VCBEND || 0;
        this.DET_SVALUE = data.DET_SVALUE || 0;
        this.DET_CVALUE = data.DET_CVALUE || 0;
        this.CR_DATE = data.CR_DATE || new Date();
        this.CR_BY = data.CR_BY;
    }

    static validate(data) {
        const errors = [];
        const start = Number(data.DET_VCBSTART);
        const end = Number(data.DET_VCBEND);

        if (!start || start <= 0) errors.push('Voucher start number is required');
        if (!end || end <= 0) errors.push('Voucher end number is required');
        if (!isNaN(start) && !isNaN(end) && end < start) errors.push('End number must be greater than start number');
        if (!data.DET_SPRICE || data.DET_SPRICE <= 0) errors.push('Voucher value is required');
        return { isValid: errors.length === 0, errors };
    }
}

module.exports = { PVCGRNHeader, PVCGRNDetail };