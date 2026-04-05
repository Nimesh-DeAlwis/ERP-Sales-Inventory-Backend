class UserGroup {
    constructor(groupData) {
        this.groupCode = groupData.UG_CODE || '';
        this.description = groupData.UG_DESC || '';
        this.status = groupData.UG_STATUS !== undefined ? groupData.UG_STATUS : true;
        this.createdDate = groupData.CR_DATE || new Date();
        this.createdBy = groupData.CR_BY || '';
        this.modifiedDate = groupData.MD_DATE || null;
        this.modifiedBy = groupData.MD_BY || null;
    }
}

class UserGroupDetail {
    constructor(detailData) {
        this.groupCode = detailData.UGD_CODE || '';
        this.menuTag = detailData.UGD_MENUTAG || '';
        this.menuRight = detailData.UGD_MENURIGHT || '000000';
        this.createdDate = detailData.CR_DATE || new Date();
        this.createdBy = detailData.CR_BY || '';
        this.modifiedDate = detailData.MD_DATE || null;
        this.modifiedBy = detailData.MD_BY || null;
        
        // Parse menu right permissions
        this.permissions = {
            access: this.menuRight.charAt(0) === '1',
            create: this.menuRight.charAt(1) === '1',
            modify: this.menuRight.charAt(2) === '1',
            delete: this.menuRight.charAt(3) === '1',
            process: this.menuRight.charAt(4) === '1',
            print: this.menuRight.charAt(5) === '1'
        };
    }
}

class UserGroupWithDetails {
    constructor(groupData, details = []) {
        this.groupCode = groupData.groupCode;
        this.description = groupData.description;
        this.status = groupData.status;
        this.details = details;
        this.createdDate = groupData.createdDate;
        this.createdBy = groupData.createdBy;
    }
}

class Menu {
    constructor(menuData) {
        this.menuTag = menuData.MENU_TAG || '';
        this.menuName = menuData.MENU_NAME || '';
        this.menuRoute = menuData.MENU_ROUTE || '';
        this.menuRight = menuData.MENU_RIGHT || '';
        this.parentId = menuData.MENU_PARENT_ID || '';
        this.level = menuData.MENU_LEVEL || 1;
        this.order = menuData.MENU_ORDER || 1;
        this.isActive = menuData.IS_ACTIVE !== undefined ? menuData.IS_ACTIVE : true;
        this.isBackoffice = menuData.IS_BACKOFFICE !== undefined ? menuData.IS_BACKOFFICE : true;
        this.isPOS = menuData.IS_POS !== undefined ? menuData.IS_POS : false;
    }
}

class UserGroupSearchCriteria {
    constructor(criteria) {
        this.searchText = criteria.searchText || '';
        this.status = criteria.status !== undefined ? criteria.status : null;
        this.page = criteria.page || 1;
        this.pageSize = criteria.pageSize || 20;
        this.sortBy = criteria.sortBy || 'UG_CODE';
        this.sortOrder = criteria.sortOrder || 'ASC';
    }
}

module.exports = {
    UserGroup,
    UserGroupDetail,
    UserGroupWithDetails,
    Menu,
    UserGroupSearchCriteria
};