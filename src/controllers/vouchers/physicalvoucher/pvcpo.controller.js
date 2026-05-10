const pvcpoService = require('../../../services/vouchers/physicalvoucher/pvcpo.service');

// Get next document number
const getNextRunNo = async (req, res) => {
    try {
        const { type, comCode } = req.query;
        
        if (!type || !comCode) {
            return res.status(400).json({
                success: false,
                message: 'Type and company code are required'
            });
        }

        const nextNo = await pvcpoService.getNextRunNo(type, comCode);
        
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

// Get voucher groups
const getVoucherGroups = async (req, res) => {
    try {
        const result = await pvcpoService.getVoucherGroups();
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get voucher groups error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create Voucher PO
const createPVCPO = async (req, res) => {
    try {
        const { header, details } = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await pvcpoService.createPVCPO(header, details, currentUser);

        res.status(201).json(result);
    } catch (error) {
        console.error('Create Voucher PO error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update Voucher PO
const updatePVCPO = async (req, res) => {
    try {
        const { header, details } = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await pvcpoService.updatePVCPO(header, details, currentUser);

        res.json(result);
    } catch (error) {
        console.error('Update Voucher PO error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Process document
const processDocument = async (req, res) => {
    try {
        const { type, runNo } = req.params;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await pvcpoService.processDocument(type, runNo, currentUser);

        res.json(result);
    } catch (error) {
        console.error('Process document error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Cancel document
const cancelDocument = async (req, res) => {
    try {
        const { type, runNo } = req.params;
        const { canDate, canUser } = req.body;
        const currentUser = req.user?.userId || 'SYSTEM';

        const result = await pvcpoService.cancelDocument(type, runNo, currentUser, canDate, canUser);

        res.json(result);
    } catch (error) {
        console.error('Cancel document error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get document by ID
const getDocumentByNo = async (req, res) => {
    try {
        const { type, runNo } = req.params;

        const result = await pvcpoService.getDocumentByNo(type, runNo);

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

        const result = await pvcpoService.searchDocuments(searchCriteria);

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
        const { type, runNo } = req.params;
        
        const pdfBuffer = await pvcpoService.generatePDF(type, runNo);
        
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=PVCPO_${runNo}.pdf`,
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
    getVoucherGroups,
    createPVCPO,
    updatePVCPO,
    processDocument,
    cancelDocument,
    getDocumentByNo,
    searchDocuments,
    printDocument
};