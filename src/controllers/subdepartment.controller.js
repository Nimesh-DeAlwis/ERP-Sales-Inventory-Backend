const subDepartmentService = require('../services/subdepartment.service');

// Get all sub departments (for dropdown)
const getAllSubDepartments = async (req, res) => {
    try {
        const subDepartments = await subDepartmentService.getAllSubDepartments();
        
        res.json({
            success: true,
            data: subDepartments
        });
    } catch (error) {
        console.error('Get all sub departments error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get next sub department code
const getNextSubDepartmentCode = async (req, res) => {
    try {
        const nextCode = await subDepartmentService.getNextSubDepartmentCode();
        
        res.json({
            success: true,
            data: nextCode
        });
    } catch (error) {
        console.error('Get next sub department code error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create sub department
const createSubDepartment = async (req, res) => {
    try {
        const subDepartmentData = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await subDepartmentService.createSubDepartment(subDepartmentData, currentUser);

        res.status(201).json({
            success: true,
            message: 'Sub Department created successfully',
            data: result
        });
    } catch (error) {
        console.error('Create sub department error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update sub department
const updateSubDepartment = async (req, res) => {
    try {
        const subDepartmentCode = req.params.id;
        const subDepartmentData = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await subDepartmentService.updateSubDepartment(subDepartmentCode, subDepartmentData, currentUser);

        res.json({
            success: true,
            message: 'Sub Department updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Update sub department error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get sub department by code
const getSubDepartmentByCode = async (req, res) => {
    try {
        const subDepartmentCode = req.params.id;

        const result = await subDepartmentService.getSubDepartmentByCode(subDepartmentCode);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Sub Department not found'
            });
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get sub department error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Search sub departments
const searchSubDepartments = async (req, res) => {
    try {
        const searchCriteria = req.query;

        const result = await subDepartmentService.searchSubDepartments(searchCriteria);

        res.json({
            success: true,
            data: result.subDepartments,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Search sub departments error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete sub department
const deleteSubDepartment = async (req, res) => {
    try {
        const subDepartmentCode = req.params.id;
        const currentUser = req.user?.userId || 'SYSTEM';

        await subDepartmentService.deleteSubDepartment(subDepartmentCode, currentUser);

        res.json({
            success: true,
            message: 'Sub Department deleted successfully'
        });
    } catch (error) {
        console.error('Delete sub department error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Check duplicate sub department code
const checkDuplicateSubDepartmentCode = async (req, res) => {
    try {
        const { subDepartmentCode } = req.query;
        const excludeSubDepartmentCode = req.query.excludeSubDepartmentCode || null;

        if (!subDepartmentCode) {
            return res.status(400).json({
                success: false,
                message: 'Sub Department code is required'
            });
        }

        const exists = await subDepartmentService.checkDuplicateSubDepartmentCode(subDepartmentCode, excludeSubDepartmentCode);

        res.json({
            success: true,
            exists,
            message: exists ? `Sub Department code '${subDepartmentCode}' already exists` : 'Sub Department code available'
        });
    } catch (error) {
        console.error('Check duplicate sub department code error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createSubDepartment,
    updateSubDepartment,
    getSubDepartmentByCode,
    searchSubDepartments,
    deleteSubDepartment,
    getAllSubDepartments,
    checkDuplicateSubDepartmentCode,
    getNextSubDepartmentCode
};