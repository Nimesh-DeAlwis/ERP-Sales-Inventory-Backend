class UserMaster {
    constructor(userData) {
        this.userId = userData.UH_ID || null;
        this.firstName = userData.UH_FNAME || '';
        this.lastName = userData.UH_LNAME || '';
        this.fullName = userData.UH_FULLNAME || '';
        this.password = userData.UH_PASSWORD || '';
        this.userGroup = userData.UH_GROUP || '';
        this.nic = userData.UH_NIC || '';
        this.status = userData.UH_STATUS !== undefined ? userData.UH_STATUS : true;
        this.photo = userData.UH_PHOTO || null;
        this.gender = userData.UH_GENDER || '';
        this.dob = userData.UH_DOB || null;
        this.designation = userData.UH_DESIGNATION || '';
        this.address = userData.UH_ADDRESS || '';
        this.mobile = userData.UH_MOBILE || '';
        this.email = userData.UH_EMAIL || '';
        this.isAppUser = userData.UH_ISAPPUSER || 0;
        this.createdDate = userData.CR_DATE || new Date();
        this.createdBy = userData.CR_BY || '';
        this.modifiedDate = userData.MD_DATE || null;
        this.modifiedBy = userData.MD_BY || null;
        this.database = userData.UH_DB || null;
        this.maxAttempts = userData.UH_MAXATTEMPTS || 5;
        this.resetPassword = userData.UH_RESETPASSWORD !== undefined ? userData.UH_RESETPASSWORD : false;
        this.passwordExpiry = userData.UH_PASSWORD_EXPIRY || 90;
        this.loginAttempts = userData.UH_LOGINATTEMPTS || 0;
    }

    // Calculate DOB from NIC (Sri Lankan format)
    static calculateDOBFromNIC(nic) {
        if (!nic || nic.length < 10) return null;
        
        let year, dayOfYear;
        
        // Old NIC format (9 digits with V/X at end)
        if (nic.length === 10 && isNaN(nic.charAt(9))) {
            const numericPart = parseInt(nic.substring(0, 9));
            year = 1900 + parseInt(nic.substring(0, 2));
            dayOfYear = numericPart % 1000;
        }
        // New NIC format (12 digits)
        else if (nic.length === 12) {
            year = parseInt(nic.substring(0, 4));
            dayOfYear = parseInt(nic.substring(4, 7));
        } else {
            return null;
        }
        
        if (dayOfYear > 500) {
            dayOfYear -= 500; // For females
        }
        
        if (dayOfYear > 366 || dayOfYear < 1) return null;
        
        const date = new Date(year, 0); // January 1st of the year
        date.setDate(dayOfYear);
        
        return date;
    }

    // Extract gender from NIC
    static getGenderFromNIC(nic) {
        if (!nic || nic.length < 9) return '';
        
        let dayOfYear;
        
        if (nic.length === 10 && isNaN(nic.charAt(9))) {
            dayOfYear = parseInt(nic.substring(0, 9)) % 1000;
        } else if (nic.length === 12) {
            dayOfYear = parseInt(nic.substring(4, 7));
        } else {
            return '';
        }
        
        return dayOfYear > 500 ? 'F' : 'M';
    }

    // Validate Sri Lankan phone number
    static validatePhoneNumber(phone) {
        if (!phone) return false;
        // Remove spaces, dashes, and plus sign
        const cleanPhone = phone.replace(/[\s\-+]/g, '');
        // Sri Lankan mobile numbers: 07xxxxxxxx or 7xxxxxxxx or +947xxxxxxxx
        const mobileRegex = /^(?:\+94|0)?7[0-9]{8}$/;
        // Sri Lankan landline: 0xx xxxxxxx
        const landlineRegex = /^0[1-9][0-9]{7,8}$/;
        
        return mobileRegex.test(cleanPhone) || landlineRegex.test(cleanPhone);
    }

    // Format phone number
    static formatPhoneNumber(phone) {
        if (!phone) return '';
        const cleanPhone = phone.replace(/[\s\-+]/g, '');
        
        if (cleanPhone.startsWith('94') && cleanPhone.length === 11) {
            return '+94 ' + cleanPhone.substring(2, 5) + ' ' + cleanPhone.substring(5, 8) + ' ' + cleanPhone.substring(8);
        } else if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
            return cleanPhone.substring(0, 3) + ' ' + cleanPhone.substring(3, 6) + ' ' + cleanPhone.substring(6);
        } else if (cleanPhone.startsWith('7') && cleanPhone.length === 9) {
            return '0' + cleanPhone.substring(0, 2) + ' ' + cleanPhone.substring(2, 5) + ' ' + cleanPhone.substring(5);
        }
        
        return phone;
    }
}

class UserLocationMaster {
    constructor(locationData) {
        this.userId = locationData.UL_ID || '';
        this.locationCode = locationData.UL_LOC || '';
        this.dateFrom = locationData.UL_DATEFROM || new Date();
        this.dateTo = locationData.UL_DATETO || new Date(new Date().setFullYear(new Date().getFullYear() + 1));
        this.isActive = locationData.UL_ACTIVE !== undefined ? locationData.UL_ACTIVE : true;
        this.createdDate = locationData.CR_DATE || new Date();
        this.createdBy = locationData.CR_BY || '';
        this.modifiedDate = locationData.MD_DATE || null;
        this.modifiedBy = locationData.MD_BY || null;
    }
}

class UserSearchCriteria {
    constructor(criteria) {
        this.searchText = criteria.searchText || '';
        this.userGroup = criteria.userGroup || '';
        this.status = criteria.status !== undefined ? criteria.status : null;
        this.designation = criteria.designation || '';
        this.locationCode = criteria.locationCode || '';
        this.page = criteria.page || 1;
        this.pageSize = criteria.pageSize || 20;
        this.sortBy = criteria.sortBy || 'UH_ID';
        this.sortOrder = criteria.sortOrder || 'ASC';
    }
}

module.exports = {
    UserMaster,
    UserLocationMaster,
    UserSearchCriteria
};