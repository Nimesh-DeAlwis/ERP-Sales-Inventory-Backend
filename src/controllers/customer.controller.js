const customerService = require('../services/customer.service');
const path = require('path');
const fs = require('fs');

// Get next customer code
const getNextCustomerCode = async (req, res) => {
    try {
        const nextCode = await customerService.getNextCustomerCode();
        console.log('Next code in controller:', nextCode);
        
        res.json({
            success: true,
            data: nextCode
        });
    } catch (error) {
        console.error('Get next customer code error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create customer
const createCustomer = async (req, res) => {
    try {
        const customerData = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await customerService.createCustomer(customerData, currentUser);

        res.status(201).json({
            success: true,
            message: 'Customer created successfully',
            data: result
        });
    } catch (error) {
        console.error('Create customer error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update customer
const updateCustomer = async (req, res) => {
    try {
        const customerCode = req.params.id;
        const customerData = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await customerService.updateCustomer(customerCode, customerData, currentUser);

        res.json({
            success: true,
            message: 'Customer updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Update customer error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Upload customer photo - FIXED VERSION
const uploadCustomerPhoto = async (req, res) => {
    try {
        const customerCode = req.params.id;
        console.log('Uploading photo for customer:', customerCode);
        console.log('File received:', req.file);
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No photo file uploaded'
            });
        }

        // Verify the file exists
        const filePath = req.file.path;
        console.log('File saved at:', filePath);
        
        if (!fs.existsSync(filePath)) {
            console.error('File was not saved properly');
            return res.status(500).json({
                success: false,
                message: 'File was not saved properly'
            });
        }

        // Get the file path (relative to server)
        let photoPath = `/uploads/customers/${req.file.filename}`;
        
        console.log('Final photo path:', photoPath, 'length:', photoPath.length);
        console.log('Full file path:', filePath);
        
        // Update customer with photo path in database
        await customerService.updateCustomerPhoto(customerCode, photoPath, req.user?.userId || 'SYSTEM');

        res.json({
            success: true,
            message: 'Photo uploaded successfully',
            data: {
                photoPath: photoPath
            }
        });
    } catch (error) {
        console.error('Upload customer photo error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get customer by code
const getCustomerByCode = async (req, res) => {
    try {
        const customerCode = req.params.id;
        const result = await customerService.getCustomerByCode(customerCode);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get customer error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Search customers
const searchCustomers = async (req, res) => {
    try {
        const searchCriteria = req.query;
        const result = await customerService.searchCustomers(searchCriteria);

        res.json({
            success: true,
            data: result.customers,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Search customers error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete customer
const deleteCustomer = async (req, res) => {
    try {
        const customerCode = req.params.id;
        const currentUser = req.user?.userId || 'SYSTEM';

        await customerService.deleteCustomer(customerCode, currentUser);

        res.json({
            success: true,
            message: 'Customer deleted successfully'
        });
    } catch (error) {
        console.error('Delete customer error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Check duplicate customer code
const checkDuplicateCustomerCode = async (req, res) => {
    try {
        const { customerCode } = req.query;
        const excludeCustomerCode = req.query.excludeCustomerCode || null;

        if (!customerCode) {
            return res.status(400).json({
                success: false,
                message: 'Customer code is required'
            });
        }

        const exists = await customerService.checkDuplicateCustomerCode(customerCode, excludeCustomerCode);

        res.json({
            success: true,
            exists,
            message: exists ? `Customer code '${customerCode}' already exists` : 'Customer code available'
        });
    } catch (error) {
        console.error('Check duplicate customer code error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getNextCustomerCode,
    createCustomer,
    updateCustomer,
    getCustomerByCode,
    searchCustomers,
    deleteCustomer,
    checkDuplicateCustomerCode,
    uploadCustomerPhoto
};