const supplierService = require('../services/supplier.service');

// Get next supplier code
const getNextSupplierCode = async (req, res) => {
    try {
        const nextCode = await supplierService.getNextSupplierCode();
        res.json({
            success: true,
            data: nextCode
        });
    } catch (error) {
        console.error('Get next supplier code error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create supplier
const createSupplier = async (req, res) => {
    try {
        const supplierData = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await supplierService.createSupplier(supplierData, currentUser);

        res.status(201).json({
            success: true,
            message: 'Supplier created successfully',
            data: result
        });
    } catch (error) {
        console.error('Create supplier error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update supplier
const updateSupplier = async (req, res) => {
    try {
        const supplierCode = req.params.id;
        const supplierData = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await supplierService.updateSupplier(supplierCode, supplierData, currentUser);

        res.json({
            success: true,
            message: 'Supplier updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Update supplier error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get supplier by code
const getSupplierByCode = async (req, res) => {
    try {
        const supplierCode = req.params.id;

        const result = await supplierService.getSupplierByCode(supplierCode);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get supplier error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Search suppliers
const searchSuppliers = async (req, res) => {
    try {
        const searchCriteria = req.query;

        const result = await supplierService.searchSuppliers(searchCriteria);

        res.json({
            success: true,
            data: result.suppliers,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Search suppliers error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete supplier
const deleteSupplier = async (req, res) => {
    try {
        const supplierCode = req.params.id;
        const currentUser = req.user?.userId || 'SYSTEM';

        await supplierService.deleteSupplier(supplierCode, currentUser);

        res.json({
            success: true,
            message: 'Supplier deleted successfully'
        });
    } catch (error) {
        console.error('Delete supplier error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Check duplicate supplier code
const checkDuplicateSupplierCode = async (req, res) => {
    try {
        const { supplierCode } = req.query;
        const excludeSupplierCode = req.query.excludeSupplierCode || null;

        if (!supplierCode) {
            return res.status(400).json({
                success: false,
                message: 'Supplier code is required'
            });
        }

        const exists = await supplierService.checkDuplicateSupplierCode(supplierCode, excludeSupplierCode);

        res.json({
            success: true,
            exists,
            message: exists ? `Supplier code '${supplierCode}' already exists` : 'Supplier code available'
        });
    } catch (error) {
        console.error('Check duplicate supplier code error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getNextSupplierCode,
    createSupplier,
    updateSupplier,
    getSupplierByCode,
    searchSuppliers,
    deleteSupplier,
    checkDuplicateSupplierCode
};