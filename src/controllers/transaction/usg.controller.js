const usgService = require('../../services/transaction/usg.service');

// Get next document number
const getNextRunNo = async (req, res) => {
    try {
        const { type, comCode, locCode } = req.query;
        
        if (!type || !comCode || !locCode) {
            return res.status(400).json({
                success: false,
                message: 'Type, company code and location code are required'
            });
        }

        const nextNo = await usgService.getNextRunNo(type, comCode, locCode);
        
        res.json({
            success: true,
            data: nextNo
        });
    } catch (error) {
        console.error('Get next run number error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get transaction setup
const getTransactionSetup = async (req, res) => {
    try {
        const { type } = req.params;
        
        const result = await usgService.getTransactionSetup(type);
        
        res.json(result);
    } catch (error) {
        console.error('Get transaction setup error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create Usage Note
const createUSG = async (req, res) => {
    try {
        const { header, details } = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await usgService.createUSG(header, details, currentUser);

        res.status(201).json(result);
    } catch (error) {
        console.error('Create Usage Note error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update Usage Note
const updateUSG = async (req, res) => {
    try {
        const { header, details } = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await usgService.updateUSG(header, details, currentUser);

        res.json(result);
    } catch (error) {
        console.error('Update Usage Note error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Process document (deduct from inventory)
const processDocument = async (req, res) => {
    try {
        const { type, runNo, comCode, locFrom } = req.params;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await usgService.processDocument(type, runNo, comCode, locFrom, currentUser);

        res.json(result);
    } catch (error) {
        console.error('Process document error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get document by ID
const getDocumentByNo = async (req, res) => {
    try {
        const { type, runNo, comCode } = req.params;
        const locFrom = req.params.locFrom || null;

        const result = await usgService.getDocumentByNo(type, runNo, comCode, locFrom);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get document error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Search documents
const searchDocuments = async (req, res) => {
    try {
        const searchCriteria = req.query;

        const result = await usgService.searchDocuments(searchCriteria);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Search documents error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Print document
const printDocument = async (req, res) => {
    try {
        const { type, runNo, comCode, locFrom } = req.params;
        
        const pdfBuffer = await usgService.generatePDF(type, runNo, comCode, locFrom);
        
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=USG_${runNo}.pdf`,
            'Content-Length': pdfBuffer.length
        });
        
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Print document error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getNextRunNo,
    getTransactionSetup,
    createUSG,
    updateUSG,
    processDocument,
    getDocumentByNo,
    searchDocuments,
    printDocument
};