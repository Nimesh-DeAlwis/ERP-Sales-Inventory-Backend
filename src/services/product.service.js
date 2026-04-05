const { executeStoredProcedure, sql } = require('../config/database');
const { 
    Product, 
    ProductInventory, 
    ProductSupplier, 
    ProductSearchCriteria 
} = require('../models/product.model');
const fs = require('fs');
const path = require('path');

class ProductService {
    constructor() {}

    // Update product picture
async updateProductPicture(productCode, picturePath, currentUser) {
    try {
        // You need to create this stored procedure or use an update query
        await executeStoredProcedure('sp_Product_UpdatePicture', [
            { name: 'pluCode', value: productCode, type: sql.NVarChar(25) },
            { name: 'pluPicture', value: picturePath, type: sql.NVarChar(500) },
            { name: 'modifiedBy', value: currentUser, type: sql.NVarChar(10) }
        ]);

        return { success: true, message: 'Picture updated successfully' };
    } catch (error) {
        console.error('Error updating product picture:', error);
        throw error;
    }
}


    // Get next product code
    async getNextProductCode() {
        try {
            const result = await executeStoredProcedure('sp_Product_GetNextCode', []);
            
            if (result.recordset && result.recordset.length > 0) {
                return result.recordset[0].NextProductCode;
            }
            
            return '0000001';
        } catch (error) {
            console.error('Error getting next product code:', error);
            return '0000001';
        }
    }

    // Create product
    async createProduct(productData, currentUser) {
        try {
            // Check if product code already exists
            const existing = await this.getProductByCode(productData.productCode);
            if (existing) {
                throw new Error(`Product code '${productData.productCode}' already exists`);
            }

            await executeStoredProcedure('sp_Product_Create', [
                { name: 'pluCode', value: productData.productCode, type: sql.NVarChar(25) },
                { name: 'pluDesc', value: productData.description, type: sql.NVarChar(500) },
                { name: 'pluStockCode', value: productData.stockCode, type: sql.NVarChar(25) },
                { name: 'pluVendorPLU', value: productData.vendorPLU || null, type: sql.NVarChar(100) },
                { name: 'pluUnit', value: productData.unitCode, type: sql.NVarChar(10) },
                { name: 'pluCost', value: productData.costPrice, type: sql.Numeric(18,2) },
                { name: 'pluSell', value: productData.sellingPrice, type: sql.Numeric(18,2) },
                { name: 'pluPicture', value: productData.picture || null, type: sql.NVarChar(500) },
                { name: 'pluActive', value: productData.active !== undefined ? productData.active : true, type: sql.Bit },
                { name: 'pluNoDisc', value: productData.noDisc !== undefined ? productData.noDisc : 0, type: sql.Int },
                { name: 'pluRef1', value: productData.ref1 || null, type: sql.NVarChar(500) },
                { name: 'pluRef2', value: productData.ref2 || null, type: sql.NVarChar(500) },
                { name: 'pluMinusAllow', value: productData.minusAllow || false, type: sql.Bit },
                { name: 'pluExchangable', value: productData.exchangable || false, type: sql.Bit },
                { name: 'pluGroup1', value: productData.departmentCode || null, type: sql.NVarChar(10) },
                { name: 'pluGroup2', value: productData.subDepartmentCode || null, type: sql.NVarChar(10) },
                { name: 'pluGroup3', value: productData.brandCode || null, type: sql.NVarChar(10) },
                { name: 'pluDefaultSupplier', value: productData.defaultSupplier || null, type: sql.NVarChar(20) },
                { name: 'pluRefCode', value: productData.barcode || null, type: sql.NVarChar(30) },
                { name: 'pluAllowCostZero', value: productData.allowCostZero || 0, type: sql.Int },
                { name: 'createdBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return await this.getProductByCode(productData.productCode);
        } catch (error) {
            console.error('Error in createProduct:', error);
            throw error;
        }
    }

    // Update product
    async updateProduct(productCode, productData, currentUser) {
        try {
            await executeStoredProcedure('sp_Product_Update', [
                { name: 'pluCode', value: productCode, type: sql.NVarChar(25) },
                { name: 'pluDesc', value: productData.description, type: sql.NVarChar(500) },
                { name: 'pluStockCode', value: productData.stockCode, type: sql.NVarChar(25) },
                { name: 'pluVendorPLU', value: productData.vendorPLU || null, type: sql.NVarChar(100) },
                { name: 'pluUnit', value: productData.unitCode, type: sql.NVarChar(10) },
                { name: 'pluCost', value: productData.costPrice, type: sql.Numeric(18,2) },
                { name: 'pluSell', value: productData.sellingPrice, type: sql.Numeric(18,2) },
                { name: 'pluPicture', value: productData.picture || null, type: sql.NVarChar(500) },
                { name: 'pluActive', value: productData.active !== undefined ? productData.active : true, type: sql.Bit },
                { name: 'pluNoDisc', value: productData.noDisc !== undefined ? productData.noDisc : 0, type: sql.Int },
                { name: 'pluRef1', value: productData.ref1 || null, type: sql.NVarChar(500) },
                { name: 'pluRef2', value: productData.ref2 || null, type: sql.NVarChar(500) },
                { name: 'pluMinusAllow', value: productData.minusAllow || false, type: sql.Bit },
                { name: 'pluExchangable', value: productData.exchangable || false, type: sql.Bit },
                { name: 'pluGroup1', value: productData.departmentCode || null, type: sql.NVarChar(10) },
                { name: 'pluGroup2', value: productData.subDepartmentCode || null, type: sql.NVarChar(10) },
                { name: 'pluGroup3', value: productData.brandCode || null, type: sql.NVarChar(10) },
                { name: 'pluDefaultSupplier', value: productData.defaultSupplier || null, type: sql.NVarChar(20) },
                { name: 'pluRefCode', value: productData.barcode || null, type: sql.NVarChar(30) },
                { name: 'pluAllowCostZero', value: productData.allowCostZero || 0, type: sql.Int },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return await this.getProductByCode(productCode);
        } catch (error) {
            console.error('Error in updateProduct:', error);
            throw error;
        }
    }

    // Get product by code
    async getProductByCode(productCode) {
        try {
            const result = await executeStoredProcedure('sp_Product_GetByCode', [
                { name: 'pluCode', value: productCode, type: sql.NVarChar(25) }
            ]);

            if (result.recordset.length === 0) {
                return null;
            }

            return new Product(result.recordset[0]);
        } catch (error) {
            console.error('Error in getProductByCode:', error);
            throw error;
        }
    }

    // Search products with pagination
    async searchProducts(criteria) {
        try {
            const searchCriteria = new ProductSearchCriteria(criteria);
            
            let activeValue = null;
            if (searchCriteria.active !== null) {
                activeValue = searchCriteria.active === true || 
                             searchCriteria.active === 'true' || 
                             searchCriteria.active === 1 || 
                             searchCriteria.active === '1';
            }

            const result = await executeStoredProcedure('sp_Product_Search', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar(100) },
                { name: 'active', value: activeValue, type: sql.Bit },
                { name: 'page', value: searchCriteria.page, type: sql.Int },
                { name: 'pageSize', value: searchCriteria.pageSize, type: sql.Int },
                { name: 'sortBy', value: searchCriteria.sortBy, type: sql.NVarChar(50) },
                { name: 'sortOrder', value: searchCriteria.sortOrder, type: sql.NVarChar(4) }
            ]);

            const products = result.recordset.map(row => new Product(row));

            const countResult = await executeStoredProcedure('sp_Product_Count', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar(100) },
                { name: 'active', value: activeValue, type: sql.Bit }
            ]);

            const total = countResult.recordset[0] ? countResult.recordset[0].TotalCount : 0;

            return {
                products,
                pagination: {
                    page: searchCriteria.page,
                    pageSize: searchCriteria.pageSize,
                    total,
                    totalPages: Math.ceil(total / searchCriteria.pageSize)
                }
            };
        } catch (error) {
            console.error('Error in searchProducts:', error);
            throw error;
        }
    }

    // Delete product
    async deleteProduct(productCode, currentUser) {
        try {
            const result = await executeStoredProcedure('sp_Product_Delete', [
                { name: 'pluCode', value: productCode, type: sql.NVarChar(25) },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return result.recordset[0];
        } catch (error) {
            console.error('Error in deleteProduct:', error);
            throw error;
        }
    }

    // Check duplicate product code
    async checkDuplicateProductCode(productCode, excludeProductCode = null) {
        try {
            const result = await executeStoredProcedure('sp_Product_CheckDuplicate', [
                { name: 'pluCode', value: productCode, type: sql.NVarChar(25) },
                { name: 'excludePluCode', value: excludeProductCode, type: sql.NVarChar(25) }
            ]);
            
            return result.recordset[0].IsDuplicate === 1;
        } catch (error) {
            console.error('Error in checkDuplicateProductCode:', error);
            throw error;
        }
    }

    // Get product inventory
    async getProductInventory(productCode) {
        try {
            const result = await executeStoredProcedure('sp_Product_GetInventory', [
                { name: 'pluCode', value: productCode, type: sql.NVarChar(25) }
            ]);

            return result.recordset.map(row => new ProductInventory(row));
        } catch (error) {
            console.error('Error in getProductInventory:', error);
            throw error;
        }
    }

    // Save product inventory
    async saveProductInventory(inventoryData, currentUser) {
        try {
            await executeStoredProcedure('sp_Product_SaveInventory', [
                { name: 'pluCode', value: inventoryData.productCode, type: sql.NVarChar(25) },
                { name: 'locCode', value: inventoryData.locationCode, type: sql.NVarChar(5) },
                { name: 'active', value: inventoryData.active ? 1 : 0, type: sql.Int },
                { name: 'cost', value: inventoryData.costPrice, type: sql.Numeric(18,2) },
                { name: 'sell', value: inventoryData.sellingPrice, type: sql.Numeric(18,2) },
                { name: 'sih', value: inventoryData.stockInHand, type: sql.Numeric(18,3) },
                { name: 'productCode', value: inventoryData.productStockCode, type: sql.NVarChar(25) },
                { name: 'description', value: inventoryData.productDescription, type: sql.NVarChar(sql.MAX) },
                { name: 'createdBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return { success: true, message: 'Inventory saved successfully' };
        } catch (error) {
            console.error('Error in saveProductInventory:', error);
            throw error;
        }
    }

    // Delete product inventory
    async deleteProductInventory(productCode, locationCode) {
        try {
            await executeStoredProcedure('sp_Product_DeleteInventory', [
                { name: 'pluCode', value: productCode, type: sql.NVarChar(25) },
                { name: 'locCode', value: locationCode, type: sql.NVarChar(5) }
            ]);

            return { success: true, message: 'Inventory deleted successfully' };
        } catch (error) {
            console.error('Error in deleteProductInventory:', error);
            throw error;
        }
    }

    // Get product suppliers
    async getProductSuppliers(productCode) {
        try {
            const result = await executeStoredProcedure('sp_Product_GetSuppliers', [
                { name: 'pluCode', value: productCode, type: sql.NVarChar(25) }
            ]);

            return result.recordset.map(row => new ProductSupplier(row));
        } catch (error) {
            console.error('Error in getProductSuppliers:', error);
            throw error;
        }
    }

    // Save product supplier
    async saveProductSupplier(supplierData, currentUser) {
        try {
            await executeStoredProcedure('sp_Product_SaveSupplier', [
                { name: 'pluCode', value: supplierData.productCode, type: sql.NVarChar(25) },
                { name: 'locCode', value: supplierData.locationCode, type: sql.NVarChar(5) },
                { name: 'smCode', value: supplierData.supplierCode, type: sql.NVarChar(10) },
                { name: 'isDefault', value: supplierData.isDefault ? 1 : 0, type: sql.Int },
                { name: 'discount', value: supplierData.discount || 0, type: sql.Numeric(18,2) },
                { name: 'cost', value: supplierData.costPrice || 0, type: sql.Numeric(18,2) },
                { name: 'sell', value: supplierData.sellingPrice || 0, type: sql.Numeric(18,2) },
                { name: 'createdBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return { success: true, message: 'Supplier saved successfully' };
        } catch (error) {
            console.error('Error in saveProductSupplier:', error);
            throw error;
        }
    }

    // Delete product supplier
    async deleteProductSupplier(productCode, locationCode, supplierCode) {
        try {
            await executeStoredProcedure('sp_Product_DeleteSupplier', [
                { name: 'pluCode', value: productCode, type: sql.NVarChar(25) },
                { name: 'locCode', value: locationCode, type: sql.NVarChar(5) },
                { name: 'smCode', value: supplierCode, type: sql.NVarChar(10) }
            ]);

            return { success: true, message: 'Supplier deleted successfully' };
        } catch (error) {
            console.error('Error in deleteProductSupplier:', error);
            throw error;
        }
    }
}

module.exports = new ProductService();