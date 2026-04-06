const { executeStoredProcedure, sql } = require('../../config/database');
const { 
    CORHeader, 
    CORDetail, 
    CORSearchCriteria 
} = require('../../models/sales/cor.model');

class CORService {
    constructor() {}

    // Get next document number
    async getNextRunNo(type, comCode, locCode) {
        try {
            const result = await executeStoredProcedure('sp_COR_GetNextRunNo', [
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
            const result = await executeStoredProcedure('sp_COR_GetSetup', [
                { name: 'type', value: type, type: sql.NVarChar(3) }
            ]);

            return {
                success: true,
                data: {
                    txCustomer: result.recordsets[0][0]?.txCustomer || 1,
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

    // Search COI documents for reference
    async searchCOIDocuments(searchText, comCode, locFrom) {
        try {
            const result = await executeStoredProcedure('sp_COR_SearchCOI', [
                { name: 'searchText', value: searchText, type: sql.NVarChar(100) },
                { name: 'comCode', value: comCode, type: sql.NVarChar(5) },
                { name: 'locFrom', value: locFrom, type: sql.NVarChar(5) }
            ]);

            return result.recordset || [];
        } catch (error) {
            console.error('Error searching COI documents:', error);
            throw error;
        }
    }

    // Get COI document details
    async getCOIDocument(coiType, coiRunNo, comCode, locFrom) {
        try {
            const result = await executeStoredProcedure('sp_COR_GetCOI', [
                { name: 'coiType', value: coiType, type: sql.NVarChar(3) },
                { name: 'coiRunNo', value: coiRunNo, type: sql.NVarChar(13) },
                { name: 'comCode', value: comCode, type: sql.NVarChar(5) },
                { name: 'locFrom', value: locFrom, type: sql.NVarChar(5) }
            ]);

            if (result.recordsets[0].length === 0) {
                return null;
            }

            return {
                header: result.recordsets[0][0],
                details: result.recordsets[1] || []
            };
        } catch (error) {
            console.error('Error getting COI document:', error);
            throw error;
        }
    }

    // Create Sales Return (add back to inventory)
    async createSalesReturn(headerData, details, currentUser) {
        try {
            const result = await executeStoredProcedure('sp_COR_CreateReturn', [
                { name: 'type', value: headerData.type, type: sql.NVarChar(3) },
                { name: 'runNo', value: headerData.runNo, type: sql.NVarChar(13) },
                { name: 'comCode', value: headerData.comCode, type: sql.NVarChar(5) },
                { name: 'setupLoc', value: headerData.setupLoc || headerData.logLocation, type: sql.NVarChar(5) },
                { name: 'txnDate', value: headerData.txnDate, type: sql.Date },
                { name: 'time', value: new Date(), type: sql.DateTime },
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
                { name: 'processed', value: 1, type: sql.Bit },
                { name: 'cancelled', value: 0, type: sql.Bit },
                { name: 'fullyUsed', value: 0, type: sql.Bit },
                { name: 'refType', value: headerData.refType || '', type: sql.NVarChar(3) },
                { name: 'refNo', value: headerData.refNo || '', type: sql.NVarChar(13) },
                { name: 'createdBy', value: currentUser, type: sql.NVarChar(10) },
                { name: 'detailsJSON', value: JSON.stringify(details), type: sql.NVarChar(sql.MAX) }
            ]);

            return {
                success: true,
                message: 'Sales Return created successfully! Inventory updated.',
                data: {
                    type: headerData.type,
                    runNo: headerData.runNo,
                    comCode: headerData.comCode,
                    locFrom: headerData.locFrom
                }
            };
        } catch (error) {
            console.error('Error in createSalesReturn:', error);
            throw error;
        }
    }

    // Cancel Sales Return (deduct back from inventory)
    async cancelReturn(type, runNo, comCode, locFrom, currentUser) {
        try {
            const result = await executeStoredProcedure('sp_COR_CancelReturn', [
                { name: 'type', value: type, type: sql.NVarChar(3) },
                { name: 'runNo', value: runNo, type: sql.NVarChar(13) },
                { name: 'comCode', value: comCode, type: sql.NVarChar(5) },
                { name: 'locFrom', value: locFrom, type: sql.NVarChar(5) },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            return {
                success: true,
                message: 'Sales Return cancelled successfully! Inventory restored.',
                data: result.recordset[0]
            };
        } catch (error) {
            console.error('Error in cancelReturn:', error);
            throw error;
        }
    }

    // Get document by ID
    async getDocumentByNo(type, runNo, comCode, locFrom) {
        try {
            const result = await executeStoredProcedure('sp_COR_GetByDocNo', [
                { name: 'type', value: type, type: sql.NVarChar(3) },
                { name: 'runNo', value: runNo, type: sql.NVarChar(13) },
                { name: 'comCode', value: comCode, type: sql.NVarChar(5) },
                { name: 'locFrom', value: locFrom, type: sql.NVarChar(5) }
            ]);

            if (result.recordsets[0].length === 0) {
                return null;
            }

            return {
                header: new CORHeader(result.recordsets[0][0]),
                details: result.recordsets[1].map(row => new CORDetail(row))
            };
        } catch (error) {
            console.error('Error in getDocumentByNo:', error);
            throw error;
        }
    }

    // Search documents
    async searchDocuments(criteria) {
        try {
            const searchCriteria = new CORSearchCriteria(criteria);

            const result = await executeStoredProcedure('sp_COR_Search', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar(100) },
                { name: 'type', value: searchCriteria.type, type: sql.NVarChar(3) },
                { name: 'fromDate', value: searchCriteria.fromDate, type: sql.Date },
                { name: 'toDate', value: searchCriteria.toDate, type: sql.Date },
                { name: 'cusCode', value: searchCriteria.cusCode, type: sql.NVarChar(10) },
                { name: 'processed', value: searchCriteria.processed, type: sql.Bit },
                { name: 'page', value: searchCriteria.page, type: sql.Int },
                { name: 'pageSize', value: searchCriteria.pageSize, type: sql.Int }
            ]);

            const documents = result.recordset.map(row => new CORHeader(row));

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

            // Fetch location name
            let locationName = header.locFrom;
            try {
                const locResult = await executeStoredProcedure('sp_Location_GetByCode', [
                    { name: 'locationCode', value: header.locFrom, type: sql.NVarChar(5) }
                ]);
                if (locResult.recordset && locResult.recordset.length > 0) {
                    locationName = locResult.recordset[0].LOC_NAME || locResult.recordset[0].locationName || header.locFrom;
                }
            } catch (error) {
                console.warn('Could not fetch location name:', error);
                // Continue with location code as fallback
            }

            // Fetch customer name if not present
            let customerName = header.cusName || '';
            if (!customerName && header.cusCode) {
                try {
                    const custResult = await executeStoredProcedure('sp_Customer_GetByCode', [
                        { name: 'cmCode', value: header.cusCode, type: sql.NVarChar(30) }
                    ]);
                    if (custResult.recordset && custResult.recordset.length > 0) {
                        customerName = custResult.recordset[0].CM_FULLNAME || custResult.recordset[0].customerName || '';
                    }
                } catch (error) {
                    console.warn('Could not fetch customer name:', error);
                    // Continue with empty name as fallback
                }
            }

            // Header
            doc.fontSize(20).text('SALES RETURN NOTE', { align: 'center' });
            doc.moveDown();
            
            doc.fontSize(10);
            doc.text(`Return No: ${header.runNo}`, 50, 100);
            doc.text(`Date: ${new Date(header.txnDate).toLocaleDateString()}`, 50, 115);
            doc.text(`Customer: ${customerName || header.cusCode}`, 50, 130);
            if (customerName && header.cusCode) {
                doc.text(`(${header.cusCode})`, 50, 145);
            }
            doc.text(`Invoice Ref: ${header.refNo || 'N/A'}`, 50, 160);
            doc.text(`Location: ${header.locFrom} - ${locationName}`, 300, 100);
            doc.text(`Status: ${header.cancelled ? 'Cancelled' : 'Processed'}`, 300, 115);

            doc.moveDown(4);

            // Table Header
            const tableTop = 200;
            const itemCodeX = 50;
            const descX = 150;
            const qtyX = 350;
            const priceX = 420;
            const totalX = 490;

            doc.font('Helvetica-Bold');
            doc.text('Item Code', itemCodeX, tableTop);
            doc.text('Description', descX, tableTop);
            doc.text('Return Qty', qtyX, tableTop);
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
            doc.text('Total Return Value:', 350, y);
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

module.exports = new CORService();