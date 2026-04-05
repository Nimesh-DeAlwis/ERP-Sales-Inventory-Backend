const poService = require('../../services/transaction/po.service');

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

        const nextNo = await poService.getNextRunNo(type, comCode, locCode);
        
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
        
        const result = await poService.getTransactionSetup(type);
        
        res.json(result);
    } catch (error) {
        console.error('Get transaction setup error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create Purchase Order
const createPurchaseOrder = async (req, res) => {
    try {
        const { header, details } = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await poService.createPurchaseOrder(header, details, currentUser);

        res.status(201).json(result);
    } catch (error) {
        console.error('Create Purchase Order error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update Purchase Order
const updatePurchaseOrder = async (req, res) => {
    try {
        const { header, details } = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await poService.updatePurchaseOrder(header, details, currentUser);

        res.json(result);
    } catch (error) {
        console.error('Update Purchase Order error:', error);
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

        const result = await poService.processDocument(type, runNo, comCode, locFrom, currentUser);

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

        const result = await poService.getDocumentByNo(type, runNo, comCode, locFrom);

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

        const result = await poService.searchDocuments(searchCriteria);

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
        
        const pdfBuffer = await poService.generatePDF(type, runNo, comCode, locFrom);
        
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=PO_${runNo}.pdf`,
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

// Save Purchase Order
const savePurchaseOrder = async (req, res) => {
    try {
        const { headerData, details, isUpdate } = req.body;
        const currentUser = req.user.username; // Assuming user info is in req.user

        let result;
        if (isUpdate) {
            result = await poService.updatePurchaseOrder(headerData, details, currentUser);
        } else {
            result = await poService.createPurchaseOrder(headerData, details, currentUser);
        }

        return res.status(200).json({
            success: true,
            message: result.message,
            data: result.data,
            refresh: true  // Add flag to trigger refresh
        });
    } catch (error) {
        console.error('Error saving PO:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getNextRunNo,
    getTransactionSetup,
    createPurchaseOrder,
    updatePurchaseOrder,
    processDocument,
    getDocumentByNo,
    searchDocuments,
    printDocument,
    savePurchaseOrder
};