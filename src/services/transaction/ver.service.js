const { executeStoredProcedure, sql } = require('../../config/database');
const { 
    VERHeader, 
    VERDetail, 
    VERSearchCriteria 
} = require('../../models/transaction/ver.model');

class VERService {
    constructor() {}

    // Get next document number
    async getNextRunNo(type, comCode, locCode) {
        try {
            const result = await executeStoredProcedure('sp_VER_GetNextRunNo', [
                { name: 'type', value: type, type: sql.NVarChar(3) },
                { name: 'comCode', value: comCode, type: sql.NVarChar(5) },
                { name: 'locCode', value: locCode, type: sql.NVarChar(5) }
            ]);
            
            return result.recordset[0].NextRunNo;
        } catch (error) {
            console.error('Error getting next run number:', error);
            throw error;
        }
    }

    // Get transaction setup
    async getTransactionSetup(type) {
        try {
            const result = await executeStoredProcedure('sp_VER_GetSetup', [
                { name: 'type', value: type, type: sql.NVarChar(3) }
            ]);

            return {
                success: true,
                data: {
                    txSupplier: result.recordsets[0][0]?.txSupplier || 0,
                    txCustomer: result.recordsets[0][0]?.txCustomer || 0,
                    txChangePrice: result.recordsets[0][0]?.txChangePrice || 0,
                    defaultLocFrom: result.recordsets[0][0]?.defaultLocFrom || '',
                    defaultLocTo: result.recordsets[0][0]?.defaultLocTo || '',
                    locations: result.recordsets[1] || []
                }
            };
        } catch (error) {
            console.error('Error getting transaction setup:', error);
            throw error;
        }
    }

    // Create Stock Verification
    async createVER(headerData, details, currentUser) {
        try {
            // Create header
            await executeStoredProcedure('sp_VER_CreateHeader', [
                { name: 'type', value: headerData.type, type: sql.NVarChar(3) },
                { name: 'runNo', value: headerData.runNo, type: sql.NVarChar(13) },
                { name: 'comCode', value: headerData.comCode, type: sql.NVarChar(5) },
                { name: 'setupLoc', value: headerData.setupLoc || headerData.logLocation, type: sql.NVarChar(5) },
                { name: 'txnDate', value: headerData.txnDate, type: sql.Date },
                { name: 'time', value: new Date(), type: sql.DateTime },
                { name: 'procDate', value: null, type: sql.DateTime2 },
                { name: 'logLocation', value: headerData.logLocation, type: sql.NVarChar(6) },
                { name: 'locFrom', value: headerData.locFrom, type: sql.NVarChar(6) },
                { name: 'locTo', value: headerData.locTo || '', type: sql.NVarChar(6) },
                { name: 'locDel', value: headerData.locDel || '', type: sql.NVarChar(6) },
                { name: 'supCode', value: headerData.supCode || '', type: sql.NVarChar(10) },
                { name: 'cusCode', value: headerData.cusCode || '', type: sql.NVarChar(10) },
                { name: 'ref1', value: headerData.ref1 || '', type: sql.NVarChar(50) },
                { name: 'ref2', value: headerData.ref2 || '', type: sql.NVarChar(50) },
                { name: 'groAmt', value: headerData.groAmt, type: sql.Numeric(18,4) },
                { name: 'discPer', value: headerData.discPer, type: sql.Numeric(18,4) },
                { name: 'netAmt', value: headerData.netAmt, type: sql.Numeric(18,4) },
                { name: 'canUser', value: headerData.canUser || '', type: sql.NVarChar(10) },
                { name: 'processed', value: 0, type: sql.Bit },
                { name: 'cancelled', value: 0, type: sql.Bit },
                { name: 'fullyUsed', value: 0, type: sql.Bit },
                { name: 'refType', value: headerData.refType || '', type: sql.NVarChar(3) },
                { name: 'refNo', value: headerData.refNo || '', type: sql.NVarChar(13) },
                { name: 'createdBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            // Create details
            for (const detail of details) {
                await executeStoredProcedure('sp_VER_CreateDetail', [
                    { name: 'lineNo', value: detail.lineNo, type: sql.Numeric(18,0) },
                    { name: 'type', value: headerData.type, type: sql.NVarChar(3) },
                    { name: 'runNo', value: headerData.runNo, type: sql.NVarChar(13) },
                    { name: 'comCode', value: headerData.comCode, type: sql.NVarChar(5) },
                    { name: 'locFrom', value: headerData.locFrom, type: sql.NVarChar(5) },
                    { name: 'locTo', value: headerData.locTo || '', type: sql.NVarChar(5) },
                    { name: 'saCode', value: detail.saCode || '', type: sql.NVarChar(10) },
                    { name: 'proCode', value: detail.proCode, type: sql.NVarChar(25) },
                    { name: 'stockCode', value: detail.stockCode || '', type: sql.NVarChar(25) },
                    { name: 'proDesc', value: detail.proDesc, type: sql.NVarChar(100) },
                    { name: 'unit', value: detail.unit, type: sql.NVarChar(10) },
                    { name: 'additionsQty', value: detail.additionsQty || 0, type: sql.Int },
                    { name: 'deductionsQty', value: detail.deductionsQty || 0, type: sql.Int },
                    { name: 'sPrice', value: detail.sPrice, type: sql.Numeric(18,4) },
                    { name: 'cPrice', value: detail.cPrice, type: sql.Numeric(18,4) },
                    { name: 'discPer', value: detail.discPer, type: sql.Numeric(18,4) },
                    { name: 'discAmt', value: detail.discAmt, type: sql.Numeric(18,4) },
                    { name: 'amount', value: detail.amount, type: sql.Numeric(18,4) },
                    { name: 'createdBy', value: currentUser, type: sql.NVarChar(10) }
                ]);
            }

            return {
                success: true,
                message: 'Stock Verification created successfully',
                data: {
                    type: headerData.type,
                    runNo: headerData.runNo,
                    comCode: headerData.comCode,
                    locFrom: headerData.locFrom
                }
            };
        } catch (error) {
            console.error('Error in createVER:', error);
            throw error;
        }
    }

    // Update Stock Verification
    async updateVER(header, details, currentUser) {
        const transaction = new sql.Transaction();
        try {
            await transaction.begin();
            const request = new sql.Request(transaction);

            // Update Header
            await request.query(`
                UPDATE T_TBLVERHEADER SET 
                    HED_LOCFROM = '${header.locFrom}',
                    HED_LOCTO = '${header.locTo}',
                    HED_REF1 = '${header.ref1 || ''}',
                    HED_REF2 = '${header.ref2 || ''}',
                    HED_GROAMT = ${header.groAmt || 0},
                    HED_DISCPER = ${header.discPer || 0},
                    HED_NETAMT = ${header.netAmt || 0},
                    MD_DATE = GETDATE(),
                    MD_BY = '${currentUser}'
                WHERE HED_RUNNO = '${header.runNo}' 
                AND HED_TYPE = '${header.type}' 
                AND HED_COMCODE = '${header.comCode}'
                AND HED_LOCFROM = '${header.locFrom}'
                AND HED_PROCESSED = 0
            `);

            // Delete existing details
            await request.query(`
                DELETE FROM T_TBLVERDETAILS 
                WHERE DET_RUNNO = '${header.runNo}' 
                AND DET_TYPE = '${header.type}' 
                AND DET_COMCODE = '${header.comCode}'
                AND DET_LOCFROM = '${header.locFrom}'
            `);

            // Insert new details
            for (const detail of details) {
                await request.query(`
                    INSERT INTO T_TBLVERDETAILS (
                        DET_TYPE, DET_RUNNO, DET_COMCODE, DET_LINENO, 
                        DET_LOCFROM, DET_LOCTO, DET_SACODE,
                        DET_PROCODE, DET_STOCKCODE, DET_PRODESC, DET_UNIT,
                        DET_ADDTIONSQTY, DET_DEDUCTIONSQTY,
                        DET_CPRICE, DET_SPRICE, 
                        DET_DISCPER, DET_DISCAMT, DET_AMOUNT,
                        CR_DATE, CR_BY
                    ) VALUES (
                        '${header.type}', '${header.runNo}', '${header.comCode}', ${detail.lineNo},
                        '${header.locFrom}', '${header.locTo || ''}', '${detail.saCode || ''}',
                        '${detail.proCode}', '${detail.stockCode}', '${detail.proDesc}', '${detail.unit}',
                        ${detail.additionsQty || 0}, ${detail.deductionsQty || 0},
                        ${detail.cPrice}, ${detail.sPrice},
                        ${detail.discPer}, ${detail.discAmt}, ${detail.amount},
                        GETDATE(), '${currentUser}'
                    )
                `);
            }

            await transaction.commit();
            
            return {
                success: true,
                message: 'Stock Verification updated successfully',
                data: { runNo: header.runNo }
            };
        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error('Error in updateVER:', error);
            throw error;
        }
    }

    // Process Stock Verification (Update Inventory)
    async processDocument(type, runNo, comCode, locFrom, currentUser) {
        try {
            const result = await executeStoredProcedure('sp_VER_Process', [
                { name: 'type', value: type, type: sql.NVarChar(3) },
                { name: 'runNo', value: runNo, type: sql.NVarChar(13) },
                { name: 'comCode', value: comCode, type: sql.NVarChar(5) },
                { name: 'locFrom', value: locFrom, type: sql.NVarChar(5) },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return {
                success: true,
                message: 'Stock Verification processed successfully! Inventory updated.',
                data: result.recordset[0]
            };
        } catch (error) {
            console.error('Error in processDocument:', error);
            throw error;
        }
    }

    // Get document by ID
    async getDocumentByNo(type, runNo, comCode, locFrom) {
        try {
            const result = await executeStoredProcedure('sp_VER_GetByDocNo', [
                { name: 'type', value: type, type: sql.NVarChar(3) },
                { name: 'runNo', value: runNo, type: sql.NVarChar(13) },
                { name: 'comCode', value: comCode, type: sql.NVarChar(5) },
                { name: 'locFrom', value: locFrom, type: sql.NVarChar(5) }
            ]);

            if (result.recordsets[0].length === 0) {
                return null;
            }

            return {
                header: new VERHeader(result.recordsets[0][0]),
                details: result.recordsets[1].map(row => new VERDetail(row))
            };
        } catch (error) {
            console.error('Error in getDocumentByNo:', error);
            throw error;
        }
    }

    // Search documents
    async searchDocuments(criteria) {
        try {
            const searchCriteria = new VERSearchCriteria(criteria);

            const result = await executeStoredProcedure('sp_VER_Search', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar(100) },
                { name: 'type', value: searchCriteria.type, type: sql.NVarChar(3) },
                { name: 'fromDate', value: searchCriteria.fromDate, type: sql.Date },
                { name: 'toDate', value: searchCriteria.toDate, type: sql.Date },
                { name: 'processed', value: searchCriteria.processed, type: sql.Bit },
                { name: 'page', value: searchCriteria.page, type: sql.Int },
                { name: 'pageSize', value: searchCriteria.pageSize, type: sql.Int }
            ]);

            const documents = result.recordset.map(row => new VERHeader(row));

            return {
                documents,
                pagination: {
                    page: searchCriteria.page,
                    pageSize: searchCriteria.pageSize,
                    total: result.recordset.length
                }
            };
        } catch (error) {
            console.error('Error in searchDocuments:', error);
            throw error;
        }
    }

    // Generate PDF
    async generatePDF(type, runNo, comCode, locFrom) {
        try {
            const data = await this.getDocumentByNo(type, runNo, comCode, locFrom);
            
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
            doc.fontSize(20).text('STOCK VERIFICATION NOTE', { align: 'center' });
            doc.moveDown();
            
            doc.fontSize(10);
            doc.text(`Document No: ${header.runNo}`, 50, 100);
            doc.text(`Date: ${new Date(header.txnDate).toLocaleDateString()}`, 50, 115);
            doc.text(`Location: ${header.locFrom}`, 300, 100);
            doc.text(`Status: ${header.processed ? 'Processed' : (header.cancelled ? 'Cancelled' : 'Pending')}`, 300, 115);
            
            if (header.supCode) {
                doc.text(`Supplier: ${header.supCode}`, 50, 130);
            }
            if (header.cusCode) {
                doc.text(`Customer: ${header.cusCode}`, 50, 145);
            }

            doc.moveDown(4);

            // Table Header
            const tableTop = 180;
            const itemCodeX = 50;
            const descX = 120;
            const unitX = 220;
            const addQtyX = 280;
            const dedQtyX = 340;
            const priceX = 400;
            const totalX = 470;

            doc.font('Helvetica-Bold');
            doc.text('Item Code', itemCodeX, tableTop);
            doc.text('Description', descX, tableTop);
            doc.text('Unit', unitX, tableTop);
            doc.text('Add (+)', addQtyX, tableTop);
            doc.text('Ded (-)', dedQtyX, tableTop);
            doc.text('Price', priceX, tableTop);
            doc.text('Total', totalX, tableTop);
            doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
            doc.font('Helvetica');

            let y = tableTop + 25;

            // Details
            details.forEach(item => {
                if (y > 700) {
                    doc.addPage();
                    y = 50;
                }
                const netQty = (item.additionsQty || 0) - (item.deductionsQty || 0);
                const amount = netQty * item.sPrice;
                
                doc.text(item.proCode, itemCodeX, y);
                doc.text((item.proDesc || '').substring(0, 25), descX, y);
                doc.text(item.unit || '-', unitX, y);
                doc.text((item.additionsQty || 0).toString(), addQtyX, y);
                doc.text((item.deductionsQty || 0).toString(), dedQtyX, y);
                doc.text(item.sPrice.toFixed(2), priceX, y);
                doc.text(amount.toFixed(2), totalX, y);
                y += 20;
            });

            // Totals
            doc.moveTo(50, y).lineTo(550, y).stroke();
            y += 10;
            doc.font('Helvetica-Bold');
            doc.text('Total Value:', 400, y);
            doc.text(header.netAmt.toFixed(2), totalX, y);

            // Footer
            y += 30;
            doc.fontSize(8).text('Note: Positive adjustment adds to inventory, negative adjustment deducts from inventory.', 50, y, { align: 'center' });

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

module.exports = new VERService();