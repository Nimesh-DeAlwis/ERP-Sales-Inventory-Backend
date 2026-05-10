const pvcgrnService = require('../../../services/vouchers/physicalvoucher/pvcgrn.service');
const { v4: uuidv4 } = require('uuid');

class PVCGRNController {
    
    async getSetup(req, res) {
        try {
            const { txType } = req.params;
            const result = await pvcgrnService.getSetup(txType);
            res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getNextRunNo(req, res) {
        try {
            const { txType, comCode, locCode } = req.query;
            const result = await pvcgrnService.getNextRunNo(txType, comCode, locCode);
            res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getPOByRunNo(req, res) {
        try {
            const { poRunNo, poType } = req.params;
            const result = await pvcgrnService.getPOByRunNo(poRunNo, poType);
            res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async createGRN(req, res) {
        try {
            const { header, detail } = req.body;
            const createdBy = req.user?.userId || 'SYSTEM';
            
            const result = await pvcgrnService.createGRN(header, detail, createdBy);
            res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async processGRN(req, res) {
        try {
            const { type, runNo } = req.params;
            const modifiedBy = req.user?.userId || 'SYSTEM';
            
            const result = await pvcgrnService.processGRN(type, runNo, modifiedBy);
            res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async cancelGRN(req, res) {
        try {
            const { type, runNo } = req.params;
            const { reason } = req.body;
            const cancelledBy = req.user?.userId || 'SYSTEM';
            
            const result = await pvcgrnService.cancelGRN(type, runNo, reason, cancelledBy);
            res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getGRNByRunNo(req, res) {
        try {
            const { type, runNo } = req.params;
            const result = await pvcgrnService.getGRNByRunNo(type, runNo);
            res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async searchGRN(req, res) {
        try {
            const criteria = {
                type: req.body.type,
                fromDate: req.body.fromDate,
                toDate: req.body.toDate,
                supCode: req.body.supCode,
                processed: req.body.processed,
                page: parseInt(req.body.page) || 1,
                pageSize: parseInt(req.body.pageSize) || 20
            };
            const result = await pvcgrnService.searchGRN(criteria);
            res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new PVCGRNController();