const brandService = require('../services/brand.service');

// Get all brands (for dropdown)
const getAllBrands = async (req, res) => {
    try {
        const brands = await brandService.getAllBrands();
        
        res.json({
            success: true,
            data: brands
        });
    } catch (error) {
        console.error('Get all brands error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get next brand code
const getNextBrandCode = async (req, res) => {
    try {
        const nextCode = await brandService.getNextBrandCode();
        
        res.json({
            success: true,
            data: nextCode
        });
    } catch (error) {
        console.error('Get next brand code error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create brand
const createBrand = async (req, res) => {
    try {
        const brandData = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await brandService.createBrand(brandData, currentUser);

        res.status(201).json({
            success: true,
            message: 'Brand created successfully',
            data: result
        });
    } catch (error) {
        console.error('Create brand error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update brand
const updateBrand = async (req, res) => {
    try {
        const brandCode = req.params.id;
        const brandData = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await brandService.updateBrand(brandCode, brandData, currentUser);

        res.json({
            success: true,
            message: 'Brand updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Update brand error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get brand by code
const getBrandByCode = async (req, res) => {
    try {
        const brandCode = req.params.id;

        const result = await brandService.getBrandByCode(brandCode);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Brand not found'
            });
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get brand error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Search brands
const searchBrands = async (req, res) => {
    try {
        const searchCriteria = req.query;

        const result = await brandService.searchBrands(searchCriteria);

        res.json({
            success: true,
            data: result.brands,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Search brands error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete brand
const deleteBrand = async (req, res) => {
    try {
        const brandCode = req.params.id;
        const currentUser = req.user?.userId || 'SYSTEM';

        await brandService.deleteBrand(brandCode, currentUser);

        res.json({
            success: true,
            message: 'Brand deleted successfully'
        });
    } catch (error) {
        console.error('Delete brand error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Check duplicate brand code
const checkDuplicateBrandCode = async (req, res) => {
    try {
        const { brandCode } = req.query;
        const excludeBrandCode = req.query.excludeBrandCode || null;

        if (!brandCode) {
            return res.status(400).json({
                success: false,
                message: 'Brand code is required'
            });
        }

        const exists = await brandService.checkDuplicateBrandCode(brandCode, excludeBrandCode);

        res.json({
            success: true,
            exists,
            message: exists ? `Brand code '${brandCode}' already exists` : 'Brand code available'
        });
    } catch (error) {
        console.error('Check duplicate brand code error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createBrand,
    updateBrand,
    getBrandByCode,
    searchBrands,
    deleteBrand,
    getAllBrands,
    checkDuplicateBrandCode,
    getNextBrandCode
};