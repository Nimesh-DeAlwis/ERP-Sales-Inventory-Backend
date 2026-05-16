const { executeStoredProcedure, sql } = require('../../../config/database');
const { PVCWriteOffHeader, PVCWriteOffDetail } = require('../../../models/vouchers/physicalvoucher/pvcwriteoff.model');
const XLSX = require('xlsx');

class PVCWriteOffService {
    
    async getNextRunNo(txType, comCode, locCode) {
        try {
            const params = [
                { name: 'TX_TYPE', value: txType, type: sql.NVarChar(3) },
                { name: 'COMCODE', value: comCode, type: sql.NVarChar(5) },
                { name: 'LOCCODE', value: locCode, type: sql.NVarChar(5) }
            ];
            const result = await executeStoredProcedure('sp_PVCWriteOff_GetNextRunNo', params);
            return {
                success: true,
                data: result.recordset[0]?.RunNo,
                message: 'Run number generated'
            };
        } catch (error) {
            console.error('Error getting next run number:', error);
            // Generate fallback number
            const timestamp = Date.now().toString();
            const fallbackNo = '1' + timestamp.slice(-12).padStart(12, '0');
            return {
                success: true,
                data: fallbackNo,
                message: 'Fallback run number generated'
            };
        }
    }

    async searchVouchers(searchText, location, group, status) {
        try {
            const params = [
                { name: 'VC_NUMBER', value: searchText || null, type: sql.NVarChar(50) },
                { name: 'VC_LOC', value: location || null, type: sql.NVarChar(5) },
                { name: 'VC_GROUP', value: group || null, type: sql.NVarChar(3) },
                { name: 'STATUS', value: status !== undefined ? status : 1, type: sql.Int }
            ];
            const result = await executeStoredProcedure('sp_PVCWriteOff_SearchVouchers', params);
            return {
                success: true,
                data: result.recordset || [],
                message: 'Vouchers retrieved successfully'
            };
        } catch (error) {
            console.error('Error searching vouchers:', error);
            return { success: false, message: error.message, data: [] };
        }
    }

    async createWriteOff(headerData, vouchers, createdBy) {
        try {
            const headerValidation = PVCWriteOffHeader.validate(headerData);
            if (!headerValidation.isValid) {
                return { success: false, message: headerValidation.errors.join(', ') };
            }
            
            if (!vouchers || vouchers.length === 0) {
                return { success: false, message: 'At least one voucher is required' };
            }

            const vouchersJson = JSON.stringify(vouchers.map(v => ({ VC_NUMBER: v.VC_NUMBER })));
            
            const params = [
                { name: 'HED_TYPE', value: headerData.HED_TYPE, type: sql.NVarChar(3) },
                { name: 'HED_RUNNO', value: headerData.HED_RUNNO, type: sql.NVarChar(13) },
                { name: 'HED_TXNDATE', value: headerData.HED_TXNDATE, type: sql.Date },
                { name: 'HED_TIME', value: new Date(), type: sql.DateTime },
                { name: 'HED_LOC', value: headerData.HED_LOC, type: sql.NVarChar(5) },
                { name: 'HED_REASON', value: headerData.HED_REASON, type: sql.NVarChar(200) },
                { name: 'HED_REMARKS', value: headerData.HED_REMARKS, type: sql.NVarChar(500) },
                { name: 'CR_BY', value: createdBy, type: sql.NVarChar(10) },
                { name: 'VouchersJson', value: vouchersJson, type: sql.NVarChar(sql.MAX) }
            ];
            
            const result = await executeStoredProcedure('sp_PVCWriteOff_Create', params);
            
            return {
                success: result.recordset[0]?.Success === 1,
                message: result.recordset[0]?.Message,
                documentNo: result.recordset[0]?.RunNo,
                voucherCount: result.recordset[0]?.VoucherCount || 0,
                totalValue: result.recordset[0]?.TotalValue || 0
            };
        } catch (error) {
            console.error('Error creating write off:', error);
            return { success: false, message: error.message };
        }
    }

    async getWriteOffByRunNo(type, runNo) {
        try {
            const params = [
                { name: 'HED_TYPE', value: type, type: sql.NVarChar(3) },
                { name: 'HED_RUNNO', value: runNo, type: sql.NVarChar(13) }
            ];
            const result = await executeStoredProcedure('sp_PVCWriteOff_GetByRunNo', params);
            return {
                success: true,
                data: {
                    header: result.recordsets[0]?.[0] || null,
                    details: result.recordsets[1] || []
                },
                message: 'Write off retrieved successfully'
            };
        } catch (error) {
            console.error('Error getting write off:', error);
            return { success: false, message: error.message };
        }
    }

    async searchWriteOff(criteria) {
        try {
            const params = [
                { name: 'HED_TYPE', value: criteria.type, type: sql.NVarChar(3) },
                { name: 'FROM_DATE', value: criteria.fromDate, type: sql.Date },
                { name: 'TO_DATE', value: criteria.toDate, type: sql.Date },
                { name: 'LOCATION', value: criteria.location, type: sql.NVarChar(5) },
                { name: 'PAGE', value: criteria.page || 1, type: sql.Int },
                { name: 'PAGE_SIZE', value: criteria.pageSize || 20, type: sql.Int }
            ];
            const result = await executeStoredProcedure('sp_PVCWriteOff_Search', params);
            return {
                success: true,
                data: result.recordsets[1] || [],
                total: result.recordsets[0]?.[0]?.TotalCount || 0,
                message: 'Search completed'
            };
        } catch (error) {
            console.error('Error searching write off:', error);
            return { success: false, message: error.message };
        }
    }

    // Generate Excel Template
    generateExcelTemplate() {
        try {
            // Create template data with header
            const template = [
                ['VC_NUMBER'],
                ['V00001'],
                ['V00002'],
                ['V00003'],
                ['V00004'],
                ['V00005']
            ];
            
            // Create worksheet
            const ws = XLSX.utils.aoa_to_sheet(template);
            
            // Set column width
            ws['!cols'] = [{ wch: 25 }];
            
            // Style the header row (bold)
            ws['A1'].s = { font: { bold: true } };
            
            // Create workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'VoucherWriteOff');
            
            // Generate buffer
            const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
            
            return buffer;
        } catch (error) {
            console.error('Error generating Excel template:', error);
            throw error;
        }
    }

    // Parse Excel file
    parseExcelFile(buffer) {
        try {
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);
            
            const vouchers = data.map(row => ({
                VC_NUMBER: row.VC_NUMBER || row['VC_NUMBER'] || ''
            })).filter(v => v.VC_NUMBER && v.VC_NUMBER.trim() !== '');
            
            return {
                success: true,
                data: vouchers,
                message: `Successfully parsed ${vouchers.length} vouchers`
            };
        } catch (error) {
            console.error('Error parsing Excel:', error);
            return { success: false, message: error.message, data: [] };
        }
    }
}

module.exports = new PVCWriteOffService();