const suprService = require('../../services/transaction/supr.service');

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

        const nextNo = await suprService.getNextRunNo(type, comCode, locCode);
        
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
        
        const result = await suprService.getTransactionSetup(type);
        
        res.json(result);
    } catch (error) {
        console.error('Get transaction setup error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Search GRN documents
const searchGRNDocuments = async (req, res) => {
    try {
        const { searchText, comCode, locFrom } = req.query;
        
        const results = await suprService.searchGRNDocuments(searchText, comCode, locFrom);
        
        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Search GRN documents error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get GRN document
const getGRNDocument = async (req, res) => {
    try {
        const { grnType, grnRunNo, comCode, locFrom } = req.params;
        
        const result = await suprService.getGRNDocument(grnType, grnRunNo, comCode, locFrom);
        
        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'GRN document not found'
            });
        }
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get GRN document error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create Supplier Return
const createSUPR = async (req, res) => {
    try {
        const { header, details } = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await suprService.createSUPR(header, details, currentUser);

        res.status(201).json(result);
    } catch (error) {
        console.error('Create Supplier Return error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update Supplier Return
const updateSUPR = async (req, res) => {
    try {
        const { header, details } = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await suprService.updateSUPR(header, details, currentUser);

        res.json(result);
    } catch (error) {
        console.error('Update Supplier Return error:', error);
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

        const result = await suprService.processDocument(type, runNo, comCode, locFrom, currentUser);

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

        const result = await suprService.getDocumentByNo(type, runNo, comCode, locFrom);

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

        const result = await suprService.searchDocuments(searchCriteria);

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
        
        const pdfBuffer = await suprService.generatePDF(type, runNo, comCode, locFrom);
        
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=SUPR_${runNo}.pdf`,
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
    searchGRNDocuments,
    getGRNDocument,
    createSUPR,
    updateSUPR,
    processDocument,
    getDocumentByNo,
    searchDocuments,
    printDocument
};