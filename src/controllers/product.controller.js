const productService = require('../services/product.service');
const path = require('path');
const fs = require('fs');

// Get next product code
const getNextProductCode = async (req, res) => {
    try {
        const nextCode = await productService.getNextProductCode();
        res.json({
            success: true,
            data: nextCode
        });
    } catch (error) {
        console.error('Get next product code error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create product
const createProduct = async (req, res) => {
    try {
        const productData = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await productService.createProduct(productData, currentUser);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: result
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update product
const updateProduct = async (req, res) => {
    try {
        const productCode = req.params.id;
        const productData = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await productService.updateProduct(productCode, productData, currentUser);

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get product by code
const getProductByCode = async (req, res) => {
    try {
        const productCode = req.params.id;

        const result = await productService.getProductByCode(productCode);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Search products
const searchProducts = async (req, res) => {
    try {
        const searchCriteria = req.query;

        const result = await productService.searchProducts(searchCriteria);

        res.json({
            success: true,
            data: result.products,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Search products error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete product
const deleteProduct = async (req, res) => {
    try {
        const productCode = req.params.id;
        const currentUser = req.user?.userId || 'SYSTEM';

        await productService.deleteProduct(productCode, currentUser);

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Check duplicate product code
const checkDuplicateProductCode = async (req, res) => {
    try {
        const { productCode } = req.query;
        const excludeProductCode = req.query.excludeProductCode || null;

        if (!productCode) {
            return res.status(400).json({
                success: false,
                message: 'Product code is required'
            });
        }

        const exists = await productService.checkDuplicateProductCode(productCode, excludeProductCode);

        res.json({
            success: true,
            exists,
            message: exists ? `Product code '${productCode}' already exists` : 'Product code available'
        });
    } catch (error) {
        console.error('Check duplicate product code error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get product inventory
const getProductInventory = async (req, res) => {
    try {
        const productCode = req.params.id;
        const inventory = await productService.getProductInventory(productCode);

        res.json({
            success: true,
            data: inventory
        });
    } catch (error) {
        console.error('Get product inventory error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Save product inventory
const saveProductInventory = async (req, res) => {
    try {
        const inventoryData = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await productService.saveProductInventory(inventoryData, currentUser);

        res.json({
            success: true,
            message: 'Inventory saved successfully',
            data: result
        });
    } catch (error) {
        console.error('Save product inventory error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Delete product inventory
const deleteProductInventory = async (req, res) => {
    try {
        const { productCode, locationCode } = req.params;
        await productService.deleteProductInventory(productCode, locationCode);

        res.json({
            success: true,
            message: 'Inventory deleted successfully'
        });
    } catch (error) {
        console.error('Delete product inventory error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get product suppliers
const getProductSuppliers = async (req, res) => {
    try {
        const productCode = req.params.id;
        const suppliers = await productService.getProductSuppliers(productCode);

        res.json({
            success: true,
            data: suppliers
        });
    } catch (error) {
        console.error('Get product suppliers error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Save product supplier
const saveProductSupplier = async (req, res) => {
    try {
        const supplierData = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await productService.saveProductSupplier(supplierData, currentUser);

        res.json({
            success: true,
            message: 'Supplier saved successfully',
            data: result
        });
    } catch (error) {
        console.error('Save product supplier error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Delete product supplier
const deleteProductSupplier = async (req, res) => {
    try {
        const { productCode, locationCode, supplierCode } = req.params;
        await productService.deleteProductSupplier(productCode, locationCode, supplierCode);

        res.json({
            success: true,
            message: 'Supplier deleted successfully'
        });
    } catch (error) {
        console.error('Delete product supplier error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Upload product picture
const uploadProductPicture = async (req, res) => {
    try {
        const productCode = req.params.id;
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No picture file uploaded'
            });
        }

        console.log('File uploaded:', req.file);
        console.log('File path:', req.file.path);
        console.log('File destination:', req.file.destination);
        console.log('File filename:', req.file.filename);

        // Verify the file exists
        const fileExists = fs.existsSync(req.file.path);
        console.log('File exists after upload:', fileExists);

        if (!fileExists) {
            return res.status(500).json({
                success: false,
                message: 'File was not saved properly'
            });
        }

        const picturePath = `/uploads/products/${req.file.filename}`;
        const currentUser = req.user?.userId || 'SYSTEM';
        
        // Update the product with the picture path in database
        await productService.updateProductPicture(productCode, picturePath, currentUser);

        res.json({
            success: true,
            message: 'Picture uploaded successfully',
            data: {
                picturePath: picturePath,
                filename: req.file.filename
            }
        });
    } catch (error) {
        console.error('Upload product picture error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getNextProductCode,
    createProduct,
    updateProduct,
    getProductByCode,
    searchProducts,
    deleteProduct,
    checkDuplicateProductCode,
    getProductInventory,
    saveProductInventory,
    deleteProductInventory,
    getProductSuppliers,
    saveProductSupplier,
    deleteProductSupplier,
    uploadProductPicture
};