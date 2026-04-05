class Location {
    constructor(locationData) {
        this.locationCode = locationData.LOC_CODE || '';
        this.description = locationData.LOC_DESC || '';
        this.isActive = locationData.LOC_ACTIVE !== undefined ? locationData.LOC_ACTIVE : true;
        this.mainLocation = locationData.LOC_MAINLOC || '';
        this.phone1 = locationData.LOC_PHONE1 || '';
        this.phone2 = locationData.LOC_PHONE2 || '';
        this.mobile1 = locationData.LOC_MOBILE1 || '';
        this.mobile2 = locationData.LOC_MOBILE2 || '';
        this.email = locationData.LOC_EMAIL || '';
        this.address1 = locationData.LOC_ADD1 || '';
        this.address2 = locationData.LOC_ADD2 || '';
        this.address3 = locationData.LOC_ADD3 || '';
        this.createdDate = locationData.CR_DATE || new Date();
        this.createdBy = locationData.CR_BY || '';
        this.modifiedDate = locationData.MD_DATE || null;
        this.modifiedBy = locationData.MD_BY || null;
    }
}

class LocationSearchCriteria {
    constructor(criteria) {
        this.searchText = criteria.searchText || '';
        this.isActive = criteria.isActive !== undefined ? criteria.isActive : null;
        this.mainLocation = criteria.mainLocation || '';
        this.page = criteria.page || 1;
        this.pageSize = criteria.pageSize || 20;
        this.sortBy = criteria.sortBy || 'LOC_CODE';
        this.sortOrder = criteria.sortOrder || 'ASC';
    }
}

module.exports = {
    Location,
    LocationSearchCriteria
};