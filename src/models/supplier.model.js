class Supplier {
    constructor(data) {
        this.supplierCode = data.supplierCode || data.SM_CODE || '';
        this.name = data.name || data.SM_NAME || '';
        this.groupCode = data.groupCode || data.SM_GROUP || '';
        this.status = data.status !== undefined ? data.status : 
                     (data.SM_STATUS !== undefined ? data.SM_STATUS : true);
        
        // Contact Information
        this.address1 = data.address1 || data.SM_ADD1 || '';
        this.address2 = data.address2 || data.SM_ADD2 || '';
        this.mobile1 = data.mobile1 || data.SM_MOBILE1 || '';
        this.mobile2 = data.mobile2 || data.SM_MOBILE2 || '';
        this.phone = data.phone || data.SM_PHONE || '';
        this.email = data.email || data.SM_EMAIL || '';
        
        // Bank Details
        this.account = data.account || data.SM_ACCOUNT || '';
        this.refCode = data.refCode || data.SM_REFCODE || '';
        this.bankName = data.bankName || data.SM_BANKNAME || '';
        this.bankCode = data.bankCode || data.SM_BANKCODE || '';
        this.branchName = data.branchName || data.SM_BRANCHNAME || '';
        this.branchCode = data.branchCode || data.SM_BRANCHCODE || '';
        this.accountNo = data.accountNo || data.SM_ACCOUNTNO || '';
        this.payeeName = data.payeeName || data.SM_PAYEENAME || '';
        
        this.createdDate = data.createdDate || data.CR_DATE || new Date();
        this.createdBy = data.createdBy || data.CR_BY || '';
        this.modifiedDate = data.modifiedDate || data.MD_DATE || null;
        this.modifiedBy = data.modifiedBy || data.MD_BY || null;
    }
}

class SupplierSearchCriteria {
    constructor(criteria) {
        this.searchText = criteria.searchText || '';
        this.status = criteria.status !== undefined ? criteria.status : null;
        this.groupCode = criteria.groupCode || null;
        this.page = parseInt(criteria.page) || 1;
        this.pageSize = parseInt(criteria.pageSize) || 20;
        this.sortBy = criteria.sortBy || 'SM_CODE';
        this.sortOrder = criteria.sortOrder || 'ASC';
    }
}

module.exports = {
    Supplier,
    SupplierSearchCriteria
};