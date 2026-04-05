class User {
    constructor(userData) {
        this.userId = userData.UH_ID;
        this.firstName = userData.UH_FNAME;
        this.lastName = userData.UH_LNAME;
        this.fullName = userData.UH_FULLNAME;
        this.password = userData.UH_PASSWORD;
        this.userGroup = userData.UH_GROUP;
        this.nic = userData.UH_NIC;
        this.status = userData.UH_STATUS;
        this.photo = userData.UH_PHOTO;
        this.gender = userData.UH_GENDER;
        this.dob = userData.UH_DOB;
        this.designation = userData.UH_DESIGNATION;
        this.address = userData.UH_ADDRESS;
        this.mobile = userData.UH_MOBILE;
        this.email = userData.UH_EMAIL;
        this.isAppUser = userData.UH_ISAPPUSER;
        this.loginAttempts = userData.UH_LOGINATTEMPTS;
        this.maxAttempts = userData.UH_MAXATTEMPTS;
        this.resetPassword = userData.UH_RESETPASSWORD;
        this.passwordExpiry = userData.UH_PASSWORD_EXPIRY;
        this.createdDate = userData.CR_DATE;
        this.createdBy = userData.CR_BY;
        this.modifiedDate = userData.MD_DATE;
        this.modifiedBy = userData.MD_BY;
    }
}

class UserLocation {
    constructor(locationData) {
        this.userId = locationData.UL_ID;
        this.locationCode = locationData.UL_LOC;
        this.dateFrom = locationData.UL_DATEFROM;
        this.dateTo = locationData.UL_DATETO;
        this.isActive = locationData.UL_ACTIVE;
        this.createdDate = locationData.CR_DATE;
        this.createdBy = locationData.CR_BY;
    }
}

class UserSearchResult {
    constructor(searchData) {
        this.userId = searchData.UH_ID;
        this.fullName = searchData.UH_FULLNAME;
        this.userGroup = searchData.UH_GROUP;
        this.nic = searchData.UH_NIC;
        this.status = searchData.UH_STATUS;
        this.mobile = searchData.UH_MOBILE;
        this.email = searchData.UH_EMAIL;
        this.createdDate = searchData.CR_DATE;
        this.locations = searchData.LOCATIONS || '';
    }
}

module.exports = {
    User,
    UserLocation,
    UserSearchResult
};