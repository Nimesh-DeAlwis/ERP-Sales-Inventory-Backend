const { executeStoredProcedure, sql } = require('../../config/database');
const { 
    DIRGRNHeader, 
    DIRGRNDetail, 
    DIRGRNSearchCriteria 
} = require('../../models/transaction/dirgrn.model');

class DIRGRNService {
    constructor() {}

    // Get next document number
    async getNextRunNo(type, comCode, locCode) {
        try {
            const result = await executeStoredProcedure('sp_DIRGRN_GetNextRunNo', [
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
            const result = await executeStoredProcedure('sp_DIRGRN_GetSetup', [
                { name: 'type', value: type, type: sql.NVarChar(3) }
            ]);

            return {
                success: true,
                data: {
                    txSupplier: result.recordsets[0][0]?.txSupplier || 1,
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

    // Create Direct GRN
    async createDirectGRN(headerData, details, currentUser) {
        try {
            // Create header
            await executeStoredProcedure('sp_DIRGRN_CreateHeader', [
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
                await executeStoredProcedure('sp_DIRGRN_CreateDetail', [
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
                        { name: 'unitQty', value: detail.unitQty, type: sql.Numeric(18,4) },
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
                message: 'Direct GRN created successfully',
                data: {
                    type: headerData.type,
                    runNo: headerData.runNo,
                    comCode: headerData.comCode,
                    locFrom: headerData.locFrom
                }
            };
        } catch (error) {
            console.error('Error in createDirectGRN:', error);
            throw error;
        }
    }


    async updateDirectGRN(header, details, currentUser) {
        const transaction = new sql.Transaction();
        try {
            await transaction.begin();
            const request = new sql.Request(transaction);

            // 1. Update Header
            // Ensure values are sanitized or use parameters if possible, here using template literals matching your pattern
            await request.query(`
                UPDATE T_TBLDIRHEADER SET 
                    HED_LOCFROM = '${header.locFrom}',
                    HED_LOCTO = '${header.locTo}',
                    HED_REF1 = '${header.ref1 || ''}',
                    HED_REF2 = '${header.ref2 || ''}',
                    HED_GROAMT = ${header.groAmt || 0},
                    HED_DISCPER = ${header.discPer || 0},
                    HED_NETAMT = ${header.netAmt || 0},
                    MD_DATE = GETDATE(),
                    MD_BY = '${currentUser}'
                WHERE HED_RUNNO = '${header.runNo}' AND HED_TYPE = '${header.type}' AND HED_COMCODE = '${header.comCode}'
            `);

            // 2. Delete existing details for this document
            await request.query(`
                DELETE FROM T_TBLDIRDETAILS 
                WHERE DET_RUNNO = '${header.runNo}' AND DET_TYPE = '${header.type}' AND DET_COMCODE = '${header.comCode}'
            `);

            // 3. Insert new details
            for (const detail of details) {
                await request.query(`
                    INSERT INTO T_TBLDIRDETAILS (
                        DET_TYPE, DET_RUNNO, DET_COMCODE, DET_LINENO, 
                        DET_LOCFROM, DET_LOCTO, DET_SACODE,
                        DET_PROCODE, DET_STOCKCODE, DET_PRODESC, DET_UNIT,
                        DET_UNITQTY, DET_CPRICE, DET_SPRICE, 
                        DET_DISCPER, DET_DISCAMT, DET_AMOUNT,
                        CR_DATE, CR_BY
                    ) VALUES (
                        '${header.type}', '${header.runNo}', '${header.comCode}', ${detail.lineNo},
                        '${header.locFrom}', '${header.locTo || ''}', '${detail.saCode || ''}',
                        '${detail.proCode}', '${detail.stockCode}', '${detail.proDesc}', '${detail.unit}',
                        ${detail.unitQty}, ${detail.cPrice}, ${detail.sPrice},
                        ${detail.discPer}, ${detail.discAmt}, ${detail.amount},
                        GETDATE(), '${currentUser}'
                    )
                `);
            }

            await transaction.commit();
            
            return {
                success: true,
                message: 'Direct GRN updated successfully',
                data: { runNo: header.runNo }
            };
        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error('Error in updateDirectGRN service:', error);
            throw error;
        }
    }


    // Process Direct GRN (update inventory)
    async processDocument(type, runNo, comCode, locFrom, currentUser) {
        try {
            const result = await executeStoredProcedure('sp_DIRGRN_Process', [
                { name: 'type', value: type, type: sql.NVarChar(3) },
                { name: 'runNo', value: runNo, type: sql.NVarChar(13) },
                { name: 'comCode', value: comCode, type: sql.NVarChar(5) },
                { name: 'locFrom', value: locFrom, type: sql.NVarChar(5) },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return {
                success: true,
                message: 'Document processed successfully',
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
            const result = await executeStoredProcedure('sp_DIRGRN_GetByDocNo', [
                { name: 'type', value: type, type: sql.NVarChar(3) },
                { name: 'runNo', value: runNo, type: sql.NVarChar(13) },
                { name: 'comCode', value: comCode, type: sql.NVarChar(5) },
                { name: 'locFrom', value: locFrom, type: sql.NVarChar(5) }
            ]);

            if (result.recordsets[0].length === 0) {
                return null;
            }

            return {
                header: new DIRGRNHeader(result.recordsets[0][0]),
                details: result.recordsets[1].map(row => new DIRGRNDetail(row))
            };
        } catch (error) {
            console.error('Error in getDocumentByNo:', error);
            throw error;
        }
    }

    // Search documents
    async searchDocuments(criteria) {
        try {
            const searchCriteria = new DIRGRNSearchCriteria(criteria);

            const result = await executeStoredProcedure('sp_DIRGRN_Search', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar(100) },
                { name: 'type', value: searchCriteria.type, type: sql.NVarChar(3) },
                { name: 'fromDate', value: searchCriteria.fromDate, type: sql.Date },
                { name: 'toDate', value: searchCriteria.toDate, type: sql.Date },
                { name: 'supCode', value: searchCriteria.supCode, type: sql.NVarChar(10) },
                { name: 'processed', value: searchCriteria.processed, type: sql.Bit },
                { name: 'page', value: searchCriteria.page, type: sql.Int },
                { name: 'pageSize', value: searchCriteria.pageSize, type: sql.Int }
            ]);

            const documents = result.recordset.map(row => new DIRGRNHeader(row));

            return {
                documents,
                pagination: {
                    page: searchCriteria.page,
                    pageSize: searchCriteria.pageSize,
                    total: result.recordset.length // You might want a separate count SP
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

            // Requires: npm install pdfkit
            let PDFDocument;
            try {
                PDFDocument = require('pdfkit');
            } catch (error) {
                throw new Error('PDF generation library "pdfkit" is not installed. Please run "npm install pdfkit" in the backend directory.');
            }

            const doc = new PDFDocument({ margin: 50 });
            
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));

            const { header, details } = data;

            // Header
            doc.fontSize(20).text('DIRECT GRN', { align: 'center' });
            doc.moveDown();
            
            doc.fontSize(10);
            doc.text(`Document No: ${header.runNo}`, 50, 100);
            doc.text(`Date: ${new Date(header.txnDate).toLocaleDateString()}`, 50, 115);
            doc.text(`Supplier: ${header.supCode} - ${header.supName || ''}`, 50, 130);
            doc.text(`Location: ${header.locFrom}`, 300, 100);
            doc.text(`Status: ${header.processed ? 'Processed' : (header.cancelled ? 'Cancelled' : 'Pending')}`, 300, 115);

            doc.moveDown(4);

            // Table Header
            const tableTop = 180;
            const itemCodeX = 50;
            const descX = 150;
            const qtyX = 350;
            const priceX = 420;
            const totalX = 490;

            doc.font('Helvetica-Bold');
            doc.text('Item Code', itemCodeX, tableTop);
            doc.text('Description', descX, tableTop);
            doc.text('Qty', qtyX, tableTop);
            doc.text('Price', priceX, tableTop);
            doc.text('Total', totalX, tableTop);
            doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
            doc.font('Helvetica');

            let y = tableTop + 25;

            // Details
            details.forEach(item => {
                if (y > 700) { // Add new page if page is full
                    doc.addPage();
                    y = 50;
                }
                doc.text(item.proCode, itemCodeX, y);
                doc.text((item.proDesc || '').substring(0, 35), descX, y);
                doc.text(item.unitQty.toString(), qtyX, y);
                doc.text(item.sPrice.toFixed(2), priceX, y);
                doc.text(item.amount.toFixed(2), totalX, y);
                y += 20;
            });

            // Totals
            doc.moveTo(50, y).lineTo(550, y).stroke();
            y += 10;
            doc.font('Helvetica-Bold');
            doc.text('Gross Amount:', 350, y);
            doc.text(header.groAmt.toFixed(2), 490, y);
            y += 15;
            doc.text('Discount:', 350, y);
            doc.text(`${header.discPer}%`, 490, y);
            y += 15;
            doc.fontSize(12).text('Net Amount:', 350, y);
            doc.text(header.netAmt.toFixed(2), 490, y);

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

module.exports = new DIRGRNService();