const { executeStoredProcedure, sql } = require('../../../config/database');
const { 
    PVCPOHeader, 
    PVCPODetail, 
    PVCPOSearchCriteria 
} = require('../../../models/vouchers/physicalvoucher/pvcpo.model');

class PVCPOService {
    constructor() {}

    // Get next document number
    async getNextRunNo(type, comCode) {
        try {
            const result = await executeStoredProcedure('sp_PVCPO_GetNextRunNo', [
                { name: 'type', value: type, type: sql.NVarChar(3) },
                { name: 'comCode', value: comCode, type: sql.NVarChar(5) }
            ]);
            
            return result.recordset[0].NextRunNo;
        } catch (error) {
            console.error('Error getting next run number:', error);
            throw error;
        }
    }

    // Get voucher groups for dropdown
    async getVoucherGroups() {
        try {
            const result = await executeStoredProcedure('sp_PVCPO_GetVoucherGroups', []);
            return result.recordset || [];
        } catch (error) {
            console.error('Error getting voucher groups:', error);
            throw error;
        }
    }

    // Create Voucher PO
    async createPVCPO(headerData, details, currentUser) {
        try {
            // Create header
            await executeStoredProcedure('sp_PVCPO_CreateHeader', [
                { name: 'type', value: headerData.type, type: sql.NVarChar(3) },
                { name: 'runNo', value: headerData.runNo, type: sql.NVarChar(20) },
                { name: 'txnDate', value: headerData.txnDate, type: sql.Date },
                { name: 'time', value: new Date(), type: sql.DateTime },
                { name: 'loc', value: headerData.loc || '', type: sql.NVarChar(5) },
                { name: 'supCode', value: headerData.supCode || '', type: sql.NVarChar(10) },
                { name: 'ref1', value: headerData.ref1 || '', type: sql.NVarChar(50) },
                { name: 'netAmt', value: headerData.netAmt, type: sql.Numeric(18,2) },
                { name: 'processed', value: 0, type: sql.Int },
                { name: 'cancelled', value: 0, type: sql.Int },
                { name: 'canDate', value: null, type: sql.Date },
                { name: 'canUser', value: '', type: sql.NVarChar(10) },
                { name: 'createdBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            // Create details
            for (const detail of details) {
                await executeStoredProcedure('sp_PVCPO_CreateDetail', [
                    { name: 'type', value: headerData.type, type: sql.NVarChar(3) },
                    { name: 'runNo', value: headerData.runNo, type: sql.NVarChar(20) },
                    { name: 'sPrice', value: detail.sPrice, type: sql.Numeric(18,2) },
                    { name: 'cPrice', value: detail.cPrice, type: sql.Numeric(18,2) },
                    { name: 'vcbStart', value: detail.vcbStart, type: sql.Numeric(18,2) },
                    { name: 'vcbQty', value: detail.vcbQty, type: sql.Numeric(18,2) },
                    { name: 'vcbEnd', value: detail.vcbEnd, type: sql.Numeric(18,2) },
                    { name: 'sValue', value: detail.sValue, type: sql.Numeric(18,2) },
                    { name: 'cValue', value: detail.cValue, type: sql.Numeric(18,2) },
                    { name: 'createdBy', value: currentUser, type: sql.NVarChar(10) }
                ]);
            }

            return {
                success: true,
                message: 'Physical Voucher PO created successfully',
                data: {
                    type: headerData.type,
                    runNo: headerData.runNo
                }
            };
        } catch (error) {
            console.error('Error in createPVCPO:', error);
            throw error;
        }
    }

    // Update Voucher PO
    async updatePVCPO(header, details, currentUser) {
        const transaction = new sql.Transaction();
        try {
            await transaction.begin();
            const request = new sql.Request(transaction);

            // Update Header
            await request.query(`
                UPDATE T_TBLPVCPOHEADER SET 
                    HED_TXNDATE = '${header.txnDate}',
                    HED_LOC = '${header.loc || ''}',
                    HED_SUPCODE = '${header.supCode || ''}',
                    HED_REF1 = '${header.ref1 || ''}',
                    HED_NETAMT = ${header.netAmt || 0},
                    MD_DATE = GETDATE(),
                    MD_BY = '${currentUser}'
                WHERE HED_TYPE = '${header.type}' 
                AND HED_RUNNO = '${header.runNo}'
                AND HED_PROCESSED = 0
                AND HED_CANCELLED = 0
            `);

            // Delete existing details
            await request.query(`
                DELETE FROM T_TBLPVCPODETAILS 
                WHERE DET_TYPE = '${header.type}' 
                AND DET_RUNNO = '${header.runNo}'
            `);

            // Insert new details
            for (const detail of details) {
                await request.query(`
                    INSERT INTO T_TBLPVCPODETAILS (
                        DET_TYPE, DET_RUNNO, DET_SPRICE, DET_CPRICE,
                        DET_VCBSTART, DET_VCBQTY, DET_VCBEND,
                        DET_SVALUE, DET_CVALUE, CR_DATE, CR_BY
                    ) VALUES (
                        '${header.type}', '${header.runNo}', ${detail.sPrice}, ${detail.cPrice},
                        ${detail.vcbStart}, ${detail.vcbQty}, ${detail.vcbEnd},
                        ${detail.sValue}, ${detail.cValue}, GETDATE(), '${currentUser}'
                    )
                `);
            }

            await transaction.commit();
            
            return {
                success: true,
                message: 'Physical Voucher PO updated successfully',
                data: { runNo: header.runNo }
            };
        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error('Error in updatePVCPO:', error);
            throw error;
        }
    }

    // Process Voucher PO
    async processDocument(type, runNo, currentUser) {
        try {
            const result = await executeStoredProcedure('sp_PVCPO_Process', [
                { name: 'type', value: type, type: sql.NVarChar(3) },
                { name: 'runNo', value: runNo, type: sql.NVarChar(20) },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return {
                success: true,
                message: 'Physical Voucher PO processed successfully',
                data: result.recordset[0]
            };
        } catch (error) {
            console.error('Error in processDocument:', error);
            throw error;
        }
    }

    // Cancel Voucher PO
    async cancelDocument(type, runNo, currentUser, canDate, canUser) {
        try {
            const result = await executeStoredProcedure('sp_PVCPO_Cancel', [
                { name: 'type', value: type, type: sql.NVarChar(3) },
                { name: 'runNo', value: runNo, type: sql.NVarChar(20) },
                { name: 'canDate', value: canDate || new Date(), type: sql.Date },
                { name: 'canUser', value: canUser || currentUser, type: sql.NVarChar(10) },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return {
                success: true,
                message: 'Physical Voucher PO cancelled successfully',
                data: result.recordset[0]
            };
        } catch (error) {
            console.error('Error in cancelDocument:', error);
            throw error;
        }
    }

    // Get document by ID
    async getDocumentByNo(type, runNo) {
        try {
            const result = await executeStoredProcedure('sp_PVCPO_GetByDocNo', [
                { name: 'type', value: type, type: sql.NVarChar(3) },
                { name: 'runNo', value: runNo, type: sql.NVarChar(20) }
            ]);

            if (result.recordsets[0].length === 0) {
                return null;
            }

            return {
                header: new PVCPOHeader(result.recordsets[0][0]),
                details: result.recordsets[1].map(row => new PVCPODetail(row))
            };
        } catch (error) {
            console.error('Error in getDocumentByNo:', error);
            throw error;
        }
    }

    // Search documents
    async searchDocuments(criteria) {
        try {
            const searchCriteria = new PVCPOSearchCriteria(criteria);

            const result = await executeStoredProcedure('sp_PVCPO_Search', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar(100) },
                { name: 'type', value: searchCriteria.type, type: sql.NVarChar(3) },
                { name: 'fromDate', value: searchCriteria.fromDate, type: sql.Date },
                { name: 'toDate', value: searchCriteria.toDate, type: sql.Date },
                { name: 'supCode', value: searchCriteria.supCode, type: sql.NVarChar(10) },
                { name: 'processed', value: searchCriteria.processed, type: sql.Int },
                { name: 'cancelled', value: searchCriteria.cancelled, type: sql.Int },
                { name: 'fullyUsed', value: searchCriteria.fullyUsed, type: sql.Int },
                { name: 'page', value: searchCriteria.page, type: sql.Int },
                { name: 'pageSize', value: searchCriteria.pageSize, type: sql.Int }
            ]);

            const documents = result.recordset.map(row => new PVCPOHeader(row));

            // Get total count from another recordset if available
            let total = documents.length;
            if (result.recordsets[1] && result.recordsets[1][0]) {
                total = result.recordsets[1][0].TotalCount;
            }

            return {
                documents,
                pagination: {
                    page: searchCriteria.page,
                    pageSize: searchCriteria.pageSize,
                    total: total
                }
            };
        } catch (error) {
            console.error('Error in searchDocuments:', error);
            throw error;
        }
    }

    // Generate PDF
    async generatePDF(type, runNo) {
        try {
            const data = await this.getDocumentByNo(type, runNo);
            
            if (!data) {
                throw new Error('Document not found');
            }

            let PDFDocument;
            try {
                PDFDocument = require('pdfkit');
            } catch (error) {
                throw new Error('PDF generation library "pdfkit" is not installed');
            }

            const doc = new PDFDocument({ margin: 50 });
            
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));

            const { header, details } = data;

            // Header
            doc.fontSize(20).text('PHYSICAL VOUCHER PURCHASE ORDER', { align: 'center' });
            doc.moveDown();
            
            doc.fontSize(10);
            doc.text(`PO No: ${header.runNo}`, 50, 100);
            doc.text(`Date: ${new Date(header.txnDate).toLocaleDateString()}`, 50, 115);
            doc.text(`Supplier: ${header.supCode} - ${header.supName || ''}`, 50, 130);
            doc.text(`Location: ${header.loc || 'N/A'}`, 300, 100);
            doc.text(`Status: ${header.processed ? 'Processed' : (header.cancelled ? 'Cancelled' : 'Pending')}`, 300, 115);

            doc.moveDown(4);

            // Table Header
            const tableTop = 180;
            const startX = 50;
            const qtyX = 150;
            const endX = 200;
            const sPriceX = 260;
            const cPriceX = 330;
            const sValueX = 400;
            const cValueX = 470;

            doc.font('Helvetica-Bold');
            doc.text('Start No', startX, tableTop);
            doc.text('Qty', qtyX, tableTop);
            doc.text('End No', endX, tableTop);
            doc.text('Selling Price', sPriceX, tableTop);
            doc.text('Cost Price', cPriceX, tableTop);
            doc.text('Selling Value', sValueX, tableTop);
            doc.text('Cost Value', cValueX, tableTop);
            doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
            doc.font('Helvetica');

            let y = tableTop + 25;

            // Details
            details.forEach(item => {
                if (y > 700) {
                    doc.addPage();
                    y = 50;
                }
                doc.text(item.vcbStart.toString(), startX, y);
                doc.text(item.vcbQty.toString(), qtyX, y);
                doc.text(item.vcbEnd.toString(), endX, y);
                doc.text(item.sPrice.toFixed(2), sPriceX, y);
                doc.text(item.cPrice.toFixed(2), cPriceX, y);
                doc.text(item.sValue.toFixed(2), sValueX, y);
                doc.text(item.cValue.toFixed(2), cValueX, y);
                y += 20;
            });

            // Totals
            doc.moveTo(50, y).lineTo(550, y).stroke();
            y += 10;
            doc.font('Helvetica-Bold');
            doc.text('Total PO Value:', 400, y);
            doc.text(header.netAmt.toFixed(2), 520, y);

            doc.end();

            return new Promise((resolve, reject) => {
                doc.on('end', () => {
                    resolve(Buffer.concat(buffers));
                });
                doc.on('error', reject);
            });
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }
    }
}

module.exports = new PVCPOService();