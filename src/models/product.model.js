class Product {
    constructor(data) {
        this.productCode = data.productCode || data.PLU_CODE || '';
        this.description = data.description || data.PLU_DESC || '';
        this.stockCode = data.stockCode || data.PLU_STOCKCODE || '';
        this.vendorPLU = data.vendorPLU || data.PLU_VENDORPLU || '';
        this.unitCode = data.unitCode || data.PLU_UNIT || '';
        this.costPrice = data.costPrice || data.PLU_COST || 0;
        this.sellingPrice = data.sellingPrice || data.PLU_SELL || 0;
        this.picture = data.picture || data.PLU_PICTURE || '';
        this.active = data.active !== undefined ? data.active : 
                     (data.PLU_ACTIVE !== undefined ? data.PLU_ACTIVE : true);
        this.noDisc = data.noDisc !== undefined ? data.noDisc : 
                     (data.PLU_NODISC !== undefined ? data.PLU_NODISC : 0);
        this.ref1 = data.ref1 || data.PLU_REF1 || '';
        this.ref2 = data.ref2 || data.PLU_REF2 || '';
        this.minusAllow = data.minusAllow !== undefined ? data.minusAllow : 
                         (data.PLU_MINUSALLOW !== undefined ? data.PLU_MINUSALLOW : false);
        this.exchangable = data.exchangable !== undefined ? data.exchangable : 
                          (data.PLU_EXCHANGABLE !== undefined ? data.PLU_EXCHANGABLE : false);
        this.departmentCode = data.departmentCode || data.PLU_GROUP1 || '';
        this.subDepartmentCode = data.subDepartmentCode || data.PLU_GROUP2 || '';
        this.brandCode = data.brandCode || data.PLU_GROUP3 || '';
        this.defaultSupplier = data.defaultSupplier || data.PLU_DEFAULTSUPPLIER || '';
        this.barcode = data.barcode || data.PLU_REFCODE || '';
        this.allowCostZero = data.allowCostZero !== undefined ? data.allowCostZero : 
                            (data.PLU_ALLOW_COST_ZERO !== undefined ? data.PLU_ALLOW_COST_ZERO : 0);
        this.createdDate = data.createdDate || data.CR_DATE || new Date();
        this.createdBy = data.createdBy || data.CR_BY || '';
        this.modifiedDate = data.modifiedDate || data.MD_DATE || null;
        this.modifiedBy = data.modifiedBy || data.MD_BY || null;
    }
}

class ProductInventory {
    constructor(data) {
        this.productCode = data.productCode || data.IPLU_CODE || '';
        this.locationCode = data.locationCode || data.IPLU_LOCCODE || '';
        this.locationName = data.locationName || '';
        this.active = data.active !== undefined ? data.active : 
                     (data.IPLU_ACTIVE !== undefined ? data.IPLU_ACTIVE : 1);
        this.costPrice = data.costPrice || data.IPLU_COST || 0;
        this.sellingPrice = data.sellingPrice || data.IPLU_SELL || 0;
        this.stockInHand = data.stockInHand || data.IPLU_SIH || 0;
        this.productStockCode = data.productStockCode || data.IPLU_PRODUCTCODE || '';
        this.productDescription = data.productDescription || data.IPLU_DESC || '';
        this.createdDate = data.createdDate || data.CR_DATE || new Date();
        this.createdBy = data.createdBy || data.CR_BY || '';
        this.modifiedDate = data.modifiedDate || data.MD_DATE || null;
        this.modifiedBy = data.modifiedBy || data.MD_BY || null;
    }
}

class ProductSupplier {
    constructor(data) {
        this.productCode = data.productCode || data.SPLU_CODE || '';
        this.locationCode = data.locationCode || data.SPLU_LOCCODE || '';
        this.locationName = data.locationName || '';
        this.supplierCode = data.supplierCode || data.SPLU_SMCODE || '';
        this.supplierName = data.supplierName || '';
        this.isDefault = data.isDefault !== undefined ? data.isDefault : 
                        (data.SPLU_DEF !== undefined ? data.SPLU_DEF : 0);
        this.discount = data.discount || data.SPLU_DISC || 0;
        this.costPrice = data.costPrice || data.SPLU_COST || 0;
        this.sellingPrice = data.sellingPrice || data.SPLU_SELL || 0;
        this.createdDate = data.createdDate || data.CR_DATE || new Date();
        this.createdBy = data.createdBy || data.CR_BY || '';
        this.modifiedDate = data.modifiedDate || data.MD_DATE || null;
        this.modifiedBy = data.modifiedBy || data.MD_BY || null;
    }
}

class ProductSearchCriteria {
    constructor(criteria) {
        this.searchText = criteria.searchText || '';
        this.active = criteria.active !== undefined ? criteria.active : null;
        this.page = parseInt(criteria.page) || 1;
        this.pageSize = parseInt(criteria.pageSize) || 20;
        this.sortBy = criteria.sortBy || 'PLU_CODE';
        this.sortOrder = criteria.sortOrder || 'ASC';
    }
}

module.exports = {
    Product,
    ProductInventory,
    ProductSupplier,
    ProductSearchCriteria
};