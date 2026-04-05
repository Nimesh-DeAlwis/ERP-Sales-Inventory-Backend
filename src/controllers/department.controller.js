const departmentService = require('../services/department.service');

// Get all departments (for dropdown)
const getAllDepartments = async (req, res) => {
    try {
        const departments = await departmentService.getAllDepartments();
        
        res.json({
            success: true,
            data: departments
        });
    } catch (error) {
        console.error('Get all departments error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get next department code
const getNextDepartmentCode = async (req, res) => {
    try {
        const nextCode = await departmentService.getNextDepartmentCode();
        
        res.json({
            success: true,
            data: nextCode
        });
    } catch (error) {
        console.error('Get next department code error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create department
const createDepartment = async (req, res) => {
    try {
        const departmentData = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await departmentService.createDepartment(departmentData, currentUser);

        res.status(201).json({
            success: true,
            message: 'Department created successfully',
            data: result
        });
    } catch (error) {
        console.error('Create department error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update department
const updateDepartment = async (req, res) => {
    try {
        const departmentCode = req.params.id;
        const departmentData = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await departmentService.updateDepartment(departmentCode, departmentData, currentUser);

        res.json({
            success: true,
            message: 'Department updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Update department error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get department by code
const getDepartmentByCode = async (req, res) => {
    try {
        const departmentCode = req.params.id;

        const result = await departmentService.getDepartmentByCode(departmentCode);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get department error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Search departments
const searchDepartments = async (req, res) => {
    try {
        const searchCriteria = req.query;

        const result = await departmentService.searchDepartments(searchCriteria);

        res.json({
            success: true,
            data: result.departments,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Search departments error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete department
const deleteDepartment = async (req, res) => {
    try {
        const departmentCode = req.params.id;
        const currentUser = req.user?.userId || 'SYSTEM';

        await departmentService.deleteDepartment(departmentCode, currentUser);

        res.json({
            success: true,
            message: 'Department deleted successfully'
        });
    } catch (error) {
        console.error('Delete department error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Check duplicate department code
const checkDuplicateDepartmentCode = async (req, res) => {
    try {
        const { departmentCode } = req.query;
        const excludeDepartmentCode = req.query.excludeDepartmentCode || null;

        if (!departmentCode) {
            return res.status(400).json({
                success: false,
                message: 'Department code is required'
            });
        }

        const exists = await departmentService.checkDuplicateDepartmentCode(departmentCode, excludeDepartmentCode);

        res.json({
            success: true,
            exists,
            message: exists ? `Department code '${departmentCode}' already exists` : 'Department code available'
        });
    } catch (error) {
        console.error('Check duplicate department code error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createDepartment,
    updateDepartment,
    getDepartmentByCode,
    searchDepartments,
    deleteDepartment,
    getAllDepartments,
    checkDuplicateDepartmentCode,
    getNextDepartmentCode
};