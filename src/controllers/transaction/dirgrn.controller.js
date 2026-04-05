const dirgrnService = require('../../services/transaction/dirgrn.service');

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

        const nextNo = await dirgrnService.getNextRunNo(type, comCode, locCode);
        
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
        
        const result = await dirgrnService.getTransactionSetup(type);
        
        res.json(result);
    } catch (error) {
        console.error('Get transaction setup error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create Direct GRN
const createDirectGRN = async (req, res) => {
    try {
        const { header, details } = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await dirgrnService.createDirectGRN(header, details, currentUser);

        res.status(201).json(result);
    } catch (error) {
        console.error('Create Direct GRN error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update Direct GRN
const updateDirectGRN = async (req, res) => {
    try {
        const { header, details } = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await dirgrnService.updateDirectGRN(header, details, currentUser);

        res.json(result);
    } catch (error) {
        console.error('Update Direct GRN error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Process document
const processDocument = async (req, res) => {
    try {
        const { type, runNo, comCode, locFrom } = req.params;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await dirgrnService.processDocument(type, runNo, comCode, locFrom, currentUser);

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
        const locFrom = req.params.locFrom || null; // Handle cases where locFrom is not in the URL

        const result = await dirgrnService.getDocumentByNo(type, runNo, comCode, locFrom); // Pass it to the service

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

        const result = await dirgrnService.searchDocuments(searchCriteria);

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
        
        const pdfBuffer = await dirgrnService.generatePDF(type, runNo, comCode, locFrom);
        
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=DIR_${runNo}.pdf`,
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
    createDirectGRN,
    updateDirectGRN,
    processDocument,
    getDocumentByNo,
    searchDocuments,
    printDocument
};