const titleService = require('../services/title.service');

// Create title
const createTitle = async (req, res) => {
    try {
        const titleData = req.body;
        const currentUser = req.user.userId;

        const result = await titleService.createTitle(titleData, currentUser);

        res.status(201).json({
            success: true,
            message: 'Title created successfully',
            data: result
        });
    } catch (error) {
        console.error('Create title error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update title
const updateTitle = async (req, res) => {
    try {
        const titleCode = req.params.id;
        const titleData = req.body;
        const currentUser = req.user.userId;

        const result = await titleService.updateTitle(titleCode, titleData, currentUser);

        res.json({
            success: true,
            message: 'Title updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Update title error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get title by ID
const getTitleById = async (req, res) => {
    try {
        const titleCode = req.params.id;

        const title = await titleService.getTitleById(titleCode);

        if (!title) {
            return res.status(404).json({
                success: false,
                message: 'Title not found'
            });
        }

        res.json({
            success: true,
            data: title
        });
    } catch (error) {
        console.error('Get title error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all active titles
const getAllActiveTitles = async (req, res) => {
    try {
        const titles = await titleService.getAllActiveTitles();

        res.json({
            success: true,
            data: titles
        });
    } catch (error) {
        console.error('Get all active titles error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all titles with pagination
const getAllTitles = async (req, res) => {
    try {
        const searchCriteria = req.query;

        const result = await titleService.getAllTitles(searchCriteria);

        res.json({
            success: true,
            data: result.titles,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Get all titles error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get titles for dropdown
const getTitlesForDropdown = async (req, res) => {
    try {
        const titles = await titleService.getTitlesForDropdown();

        res.json({
            success: true,
            data: titles
        });
    } catch (error) {
        console.error('Get titles for dropdown error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete title
const deleteTitle = async (req, res) => {
    try {
        const titleCode = req.params.id;
        const currentUser = req.user.userId;

        await titleService.deleteTitle(titleCode, currentUser);

        res.json({
            success: true,
            message: 'Title deleted successfully'
        });
    } catch (error) {
        console.error('Delete title error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Check duplicate title code
const checkDuplicateTitleCode = async (req, res) => {
    try {
        const { titleCode } = req.query;
        const excludeTitleCode = req.query.excludeTitleCode || null;

        if (!titleCode) {
            return res.status(400).json({
                success: false,
                message: 'Title code is required'
            });
        }

        const exists = await titleService.checkDuplicateTitleCode(titleCode, excludeTitleCode);

        res.json({
            success: true,
            exists,
            message: exists ? `Title code '${titleCode}' already exists` : 'Title code available'
        });
    } catch (error) {
        console.error('Check duplicate title code error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createTitle,
    updateTitle,
    getTitleById,
    getAllActiveTitles,
    getAllTitles,
    getTitlesForDropdown,
    deleteTitle,
    checkDuplicateTitleCode
};