const corService = require('../../services/sales/cor.service');

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

        const nextNo = await corService.getNextRunNo(type, comCode, locCode);
        
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
        
        const result = await corService.getTransactionSetup(type);
        
        res.json(result);
    } catch (error) {
        console.error('Get transaction setup error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Search COI documents
const searchCOIDocuments = async (req, res) => {
    try {
        const { searchText, comCode, locFrom } = req.query;
        
        const results = await corService.searchCOIDocuments(searchText, comCode, locFrom);
        
        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Search COI documents error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get COI document
const getCOIDocument = async (req, res) => {
    try {
        const { coiType, coiRunNo, comCode, locFrom } = req.params;
        
        const result = await corService.getCOIDocument(coiType, coiRunNo, comCode, locFrom);
        
        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'COI document not found'
            });
        }
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get COI document error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create Sales Return
const createSalesReturn = async (req, res) => {
    try {
        const { header, details } = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await corService.createSalesReturn(header, details, currentUser);

        res.status(201).json(result);
    } catch (error) {
        console.error('Create Sales Return error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Cancel Sales Return
const cancelReturn = async (req, res) => {
    try {
        const { type, runNo, comCode, locFrom } = req.params;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await corService.cancelReturn(type, runNo, comCode, locFrom, currentUser);

        res.json(result);
    } catch (error) {
        console.error('Cancel Return error:', error);
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

        const result = await corService.getDocumentByNo(type, runNo, comCode, locFrom);

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

        const result = await corService.searchDocuments(searchCriteria);

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
        
        const pdfBuffer = await corService.generatePDF(type, runNo, comCode, locFrom);
        
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=COR_${runNo}.pdf`,
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
    searchCOIDocuments,
    getCOIDocument,
    createSalesReturn,
    cancelReturn,
    getDocumentByNo,
    searchDocuments,
    printDocument
};