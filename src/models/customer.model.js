class Customer {
    constructor(data) {
        this.customerCode = data.customerCode || data.CM_CODE || '';
        this.titleCode = data.titleCode || data.CM_TITLE || '';
        this.firstName = data.firstName || data.CM_FNAME || '';
        this.lastName = data.lastName || data.CM_LNAME || '';
        this.fullName = data.fullName || data.CM_FULLNAME || '';
        this.name = data.name || data.CM_FULLNAME || data.fullName || `${data.CM_FNAME || ''} ${data.CM_LNAME || ''}`.trim() || '';
        this.groupCode = data.groupCode || data.CM_GROUP || '';
        this.nic = data.nic || data.CM_NIC || '';
        this.status = data.status !== undefined ? data.status : 
                     (data.CM_STATUS !== undefined ? data.CM_STATUS : true);
        this.photo = data.photo || data.CM_PHOTO || '';
        this.address1 = data.address1 || data.CM_ADD1 || '';
        this.mobile1 = data.mobile1 || data.CM_MOBILE1 || '';
        this.mobile2 = data.mobile2 || data.CM_MOBILE2 || '';
        this.phone1 = data.phone1 || data.CM_PHONE1 || '';
        this.phone2 = data.phone2 || data.CM_PHONE2 || '';
        this.email = data.email || data.CM_EMAIL || '';
        this.gender = data.gender || data.CM_GENDER || '';
        this.dob = data.dob || data.CM_DOB || null;
        this.reference1 = data.reference1 || data.CM_REFERENCE1 || '';
        this.reference2 = data.reference2 || data.CM_REFERENCE2 || '';
        this.createdDate = data.createdDate || data.CR_DATE || new Date();
        this.createdBy = data.createdBy || data.CR_BY || '';
        this.modifiedDate = data.modifiedDate || data.MD_DATE || null;
        this.modifiedBy = data.modifiedBy || data.MD_BY || null;
    }
}

class CustomerSearchCriteria {
    constructor(criteria) {
        this.searchText = criteria.searchText || '';
        this.status = criteria.status !== undefined ? criteria.status : null;
        this.groupCode = criteria.groupCode || null;
        this.page = parseInt(criteria.page) || 1;
        this.pageSize = parseInt(criteria.pageSize) || 20;
        this.sortBy = criteria.sortBy || 'CM_CODE';
        this.sortOrder = criteria.sortOrder || 'ASC';
    }
}

module.exports = {
    Customer,
    CustomerSearchCriteria
};