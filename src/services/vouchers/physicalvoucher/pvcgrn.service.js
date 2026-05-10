const { executeStoredProcedure, sql } = require('../../../config/database');
const { PVCGRNHeader, PVCGRNDetail } = require('../../../models/vouchers/physicalvoucher/pvcgrn.model');

class PVCGRNService {
    
    async getSetup(txType) {
        try {
            const params = [{ name: 'TX_TYPE', value: txType, type: sql.NVarChar(3) }];
            const result = await executeStoredProcedure('sp_PVCGRN_GetSetup', params);
            return {
                success: true,
                data: result.recordset[0] || null,
                message: 'Setup retrieved successfully'
            };
        } catch (error) {
            console.error('Error getting setup:', error);
            // Return default setup if stored procedure doesn't exist
            return {
                success: true,
                data: {
                    txPVSupplier: 1,
                    txPVChangePrice: 1
                },
                message: 'Default setup returned'
            };
        }
    }

    async getNextRunNo(txType, comCode, locCode) {
        try {
            const params = [
                { name: 'TX_TYPE', value: txType, type: sql.NVarChar(3) },
                { name: 'COMCODE', value: comCode, type: sql.NVarChar(5) },
                { name: 'LOCCODE', value: locCode, type: sql.NVarChar(5) }
            ];
            const result = await executeStoredProcedure('sp_PVCGRN_GetNextRunNo', params);
            return {
                success: true,
                data: result.recordset[0]?.RunNo,
                message: 'Run number generated'  
            };
        } catch (error) {
            console.error('Error getting next run number:', error);
            // Generate a numeric run number in format: 13 digits (e.g., 1000100000001)
            const timestamp = Date.now().toString();
            const suffix = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
            const numericRunNo = (100001 + parseInt(timestamp.slice(-8))).toString().slice(0, 13).padEnd(13, '0');
            return {
                success: true,
                data: numericRunNo,
                message: 'Temporary run number generated'
            };
        }
    }

    async getPOByRunNo(poRunNo, poType) {
        try {
            const params = [
                { name: 'PO_RUNNO', value: poRunNo, type: sql.NVarChar(13) },
                { name: 'PO_TYPE', value: poType, type: sql.NVarChar(3) }
            ];
            const result = await executeStoredProcedure('sp_PVCGRN_GetPOByRunNo', params);
            return {
                success: true,
                data: {
                    header: result.recordsets[0]?.[0] || null,
                    details: result.recordsets[1] || []
                },
                message: 'PO retrieved successfully'
            };
        } catch (error) {
            console.error('Error getting PO:', error);
            // Return empty PO data if stored procedure doesn't exist
            return {
                success: true,
                data: {
                    header: null,
                    details: []
                },
                message: 'PO not found or service unavailable'
            };
        }
    }

    async createGRN(headerData, detailData, createdBy) {
        try {
            const headerValidation = PVCGRNHeader.validate(headerData);
            if (!headerValidation.isValid) {
                return { success: false, message: headerValidation.errors.join(', ') };
            }
            
            const detailValidation = PVCGRNDetail.validate(detailData);
            if (!detailValidation.isValid) {
                return { success: false, message: detailValidation.errors.join(', ') };
            }

            let generatedVouchersJson = '';
            
            const params = [
                { name: 'HED_TYPE', value: headerData.HED_TYPE, type: sql.NVarChar(3) },
                { name: 'HED_RUNNO', value: headerData.HED_RUNNO, type: sql.NVarChar(13) },
                { name: 'HED_TXNDATE', value: headerData.HED_TXNDATE, type: sql.Date },
                { name: 'HED_TIME', value: new Date(), type: sql.DateTime },
                { name: 'HED_LOC', value: headerData.HED_LOC, type: sql.NVarChar(5) },
                { name: 'HED_SUPCODE', value: headerData.HED_SUPCODE, type: sql.NVarChar(10) },
                { name: 'HED_REFNO', value: headerData.HED_REFNO, type: sql.NVarChar(13) },
                { name: 'HED_REF1', value: headerData.HED_REF1, type: sql.NVarChar(50) },
                { name: 'HED_REF2', value: headerData.HED_REF2, type: sql.NVarChar(50) },
                { name: 'HED_NETAMT', value: detailData.DET_SPRICE * detailData.DET_VCBQTY, type: sql.Numeric(18,2) },
                { name: 'DET_STARTNO', value: detailData.DET_VCBSTART, type: sql.NVarChar(20) },
                { name: 'DET_ENDNO', value: detailData.DET_VCBEND, type: sql.NVarChar(20) },
                { name: 'DET_QTY', value: detailData.DET_VCBQTY, type: sql.Numeric(18,2) },
                { name: 'DET_SPRICE', value: detailData.DET_SPRICE, type: sql.Numeric(18,2) },
                { name: 'DET_CPRICE', value: detailData.DET_CPRICE || 0, type: sql.Numeric(18,2) },
                { name: 'DET_VCBSTART', value: detailData.DET_VCBSTART, type: sql.Numeric(18,2) },
                { name: 'DET_SVALUE', value: detailData.DET_SPRICE * detailData.DET_VCBQTY, type: sql.Numeric(18,2) },
                { name: 'DET_CVALUE', value: (detailData.DET_CPRICE || 0) * detailData.DET_VCBQTY, type: sql.Numeric(18,2) },
                { name: 'CR_BY', value: createdBy, type: sql.NVarChar(10) },
                { name: 'GeneratedVouchersJson', value: generatedVouchersJson, type: sql.NVarChar(sql.MAX), isOutput: true }
            ];
            
            const result = await executeStoredProcedure('sp_PVCGRN_Create', params);
            
            return {
                success: result.recordset[0]?.Success === 1,
                message: result.recordset[0]?.Message,
                documentNo: result.recordset[0]?.RunNo,
                voucherCount: result.recordset[0]?.VoucherCount || 0
            };
        } catch (error) {
            console.error('Error creating GRN:', error);
            return { success: false, message: error.message };
        }
    }

    async processGRN(type, runNo, modifiedBy) {
        try {
            const params = [
                { name: 'HED_TYPE', value: type, type: sql.NVarChar(3) },
                { name: 'HED_RUNNO', value: runNo, type: sql.NVarChar(13) },
                { name: 'MD_BY', value: modifiedBy, type: sql.NVarChar(10) }
            ];
            const result = await executeStoredProcedure('sp_PVCGRN_Process', params);
            return {
                success: result.recordset[0]?.Success === 1,
                message: result.recordset[0]?.Message
            };
        } catch (error) {
            console.error('Error processing GRN:', error);
            return { success: false, message: error.message };
        }
    }

    async cancelGRN(type, runNo, reason, cancelledBy) {
        try {
            const params = [
                { name: 'HED_TYPE', value: type, type: sql.NVarChar(3) },
                { name: 'HED_RUNNO', value: runNo, type: sql.NVarChar(13) },
                { name: 'CANCEL_REASON', value: reason, type: sql.NVarChar(200) },
                { name: 'CAN_USER', value: cancelledBy, type: sql.NVarChar(10) }
            ];
            const result = await executeStoredProcedure('sp_PVCGRN_Cancel', params);
            return {
                success: result.recordset[0]?.Success === 1,
                message: result.recordset[0]?.Message
            };
        } catch (error) {
            console.error('Error cancelling GRN:', error);
            return { success: false, message: error.message };
        }
    }

    async getGRNByRunNo(type, runNo) {
        try {
            const params = [
                { name: 'HED_TYPE', value: type, type: sql.NVarChar(3) },
                { name: 'HED_RUNNO', value: runNo, type: sql.NVarChar(13) }
            ];
            const result = await executeStoredProcedure('sp_PVCGRN_GetByRunNo', params);
            return {
                success: true,
                data: {
                    header: result.recordsets[0]?.[0] || null,
                    details: result.recordsets[1]?.[0] || null,
                    vouchers: result.recordsets[2] || []
                },
                message: 'GRN retrieved successfully'
            };
        } catch (error) {
            console.error('Error getting GRN:', error);
            return { success: false, message: error.message };
        }
    }

    async searchGRN(criteria) {
        try {
            const params = [
                { name: 'TX_TYPE', value: criteria.type, type: sql.NVarChar(3) },
                { name: 'FROM_DATE', value: criteria.fromDate, type: sql.Date },
                { name: 'TO_DATE', value: criteria.toDate, type: sql.Date },
                { name: 'SUPPLIER', value: criteria.supCode, type: sql.NVarChar(10) },
                { name: 'STATUS', value: criteria.processed, type: sql.Int },
                { name: 'PAGE', value: criteria.page || 1, type: sql.Int },
                { name: 'PAGE_SIZE', value: criteria.pageSize || 20, type: sql.Int }
            ];
            const result = await executeStoredProcedure('sp_PVCGRN_Search', params);
            return {
                success: true,
                data: result.recordsets[1] || [],
                total: result.recordsets[0]?.[0]?.TotalCount || 0,
                message: 'Search completed'
            };
        } catch (error) {
            console.error('Error searching GRN:', error);
            return { success: false, message: error.message };
        }
    }
}

module.exports = new PVCGRNService();