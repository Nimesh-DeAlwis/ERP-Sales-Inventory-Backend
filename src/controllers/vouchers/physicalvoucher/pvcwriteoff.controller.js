const XLSX = require('xlsx');
const pvcwriteoffService = require('../../../services/vouchers/physicalvoucher/pvcwriteoff.service');

class PVCWriteOffController {
    
    async getNextRunNo(req, res) {
        try {
            const { txType, comCode, locCode } = req.query;
            const result = await pvcwriteoffService.getNextRunNo(txType, comCode, locCode);
            res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async searchVouchers(req, res) {
        try {
            const { searchText, location, group, status } = req.query;
            const result = await pvcwriteoffService.searchVouchers(searchText, location, group, status);
            res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async createWriteOff(req, res) {
        try {
            const { header, vouchers } = req.body;
            const createdBy = req.user?.userId || 'ADMIN';
            
            const result = await pvcwriteoffService.createWriteOff(header, vouchers, createdBy);
            res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getWriteOffByRunNo(req, res) {
        try {
            const { type, runNo } = req.params;
            const result = await pvcwriteoffService.getWriteOffByRunNo(type, runNo);
            res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async searchWriteOff(req, res) {
        try {
            const criteria = {
                type: req.body.type,
                fromDate: req.body.fromDate,
                toDate: req.body.toDate,
                location: req.body.location,
                page: parseInt(req.body.page) || 1,
                pageSize: parseInt(req.body.pageSize) || 20
            };
            const result = await pvcwriteoffService.searchWriteOff(criteria);
            res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

     async downloadTemplate(req, res) {
        try {
            // Create template data
            const template = [
                ['VC_NUMBER'],
                ['V00001'],
                ['V00002'],
                ['V00003']
            ];
            
            const ws = XLSX.utils.aoa_to_sheet(template);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'VoucherWriteOff');
            
            // Set column width
            ws['!cols'] = [{ wch: 20 }];
            
            const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
            
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=voucher_writeoff_template.xlsx');
            res.setHeader('Content-Length', buffer.length);
            res.send(buffer);
        } catch (error) {
            console.error('Error in downloadTemplate:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async uploadExcel(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }
            
            const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);
            
            const vouchers = data.map(row => ({
                VC_NUMBER: row.VC_NUMBER || row['VC_NUMBER'] || ''
            })).filter(v => v.VC_NUMBER);
            
            res.status(200).json({
                success: true,
                data: vouchers,
                message: `Successfully parsed ${vouchers.length} vouchers`
            });
        } catch (error) {
            console.error('Error in uploadExcel:', error);
            res.status(500).json({ success: false, message: error.message, data: [] });
        }
    }
}

module.exports = new PVCWriteOffController();