const { executeStoredProcedure, sql, query } = require('../../config/database');
const { 
    GRNHeader, 
    GRNDetail, 
    GRNSearchCriteria 
} = require('../../models/transaction/grn.model');

class GRNService {
    constructor() {}

    // Get next document number
    async getNextRunNo(type, comCode, locCode) {
        try {
            const result = await executeStoredProcedure('sp_GRN_GetNextRunNo', [
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
            const result = await executeStoredProcedure('sp_GRN_GetSetup', [
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

    // Get PO document details
    async getPODocument(poType, poRunNo, comCode, locFrom) {
        try {
            const result = await executeStoredProcedure('sp_GRN_GetPODocument', [
                { name: 'poType', value: poType, type: sql.NVarChar(3) },
                { name: 'poRunNo', value: poRunNo, type: sql.NVarChar(13) },
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
            console.error('Error getting PO document:', error);
            throw error;
        }
    }

    // Search PO documents
    async searchPODocuments(searchText, comCode, locFrom) {
        try {
            const result = await executeStoredProcedure('sp_GRN_SearchPO', [
                { name: 'searchText', value: searchText, type: sql.NVarChar(100) },
                { name: 'comCode', value: comCode, type: sql.NVarChar(5) },
                { name: 'locFrom', value: locFrom, type: sql.NVarChar(5) }
            ]);

            const allPOs = result.recordset || [];
            console.log('PO search results before filtering:', allPOs.slice(0, 2)); // Log first 2 results to see structure

            // Filter out fully used POs (HED_FULLYUSED = 1)
            const availablePOs = allPOs.filter(po => {
                // Check both HED_FULLYUSED and fullyUsed fields
                const isFullyUsed = po.HED_FULLYUSED === 1 || po.HED_FULLYUSED === true || po.fullyUsed === 1 || po.fullyUsed === true;
                console.log(`PO ${po.HED_RUNNO}: HED_FULLYUSED=${po.HED_FULLYUSED}, fullyUsed=${po.fullyUsed}, isFullyUsed=${isFullyUsed}`);
                return !isFullyUsed;
            });

            console.log(`Filtered ${allPOs.length} POs down to ${availablePOs.length} available POs`);

            return availablePOs;
        } catch (error) {
            console.error('Error searching PO documents:', error);
            throw error;
        }
    }

    // Create GRN
    async createGRN(headerData, details, currentUser) {
        try {
            // Create header
            await executeStoredProcedure('sp_GRN_CreateHeader', [
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
                await executeStoredProcedure('sp_GRN_CreateDetail', [
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
                message: 'GRN created successfully',
                data: {
                    type: headerData.type,
                    runNo: headerData.runNo,
                    comCode: headerData.comCode,
                    locFrom: headerData.locFrom
                }
            };
        } catch (error) {
            console.error('Error in createGRN:', error);
            throw error;
        }
    }

    // Update GRN
    async updateGRN(header, details, currentUser) {
        const transaction = new sql.Transaction();
        try {
            await transaction.begin();
            const request = new sql.Request(transaction);

            // Update Header
            await request.query(`
                UPDATE T_TBLGRNHEADER SET 
                    HED_LOCFROM = '${header.locFrom}',
                    HED_LOCTO = '${header.locTo}',
                    HED_REF1 = '${header.ref1 || ''}',
                    HED_REF2 = '${header.ref2 || ''}',
                    HED_GROAMT = ${header.groAmt || 0},
                    HED_DISCPER = ${header.discPer || 0},
                    HED_NETAMT = ${header.netAmt || 0},
                    HED_REFTYPE = '${header.refType || ''}',
                    HED_REFNO = '${header.refNo || ''}',
                    MD_DATE = GETDATE(),
                    MD_BY = '${currentUser}'
                WHERE HED_RUNNO = '${header.runNo}' 
                AND HED_TYPE = '${header.type}' 
                AND HED_COMCODE = '${header.comCode}'
                AND HED_LOCFROM = '${header.locFrom}'
                AND HED_PROCESSED = 0
            `);

            // Delete existing details for this document
            await request.query(`
                DELETE FROM T_TBLGRNDETAILS 
                WHERE DET_RUNNO = '${header.runNo}' 
                AND DET_TYPE = '${header.type}' 
                AND DET_COMCODE = '${header.comCode}'
                AND DET_LOCFROM = '${header.locFrom}'
            `);

            // Insert new details
            for (const detail of details) {
                await request.query(`
                    INSERT INTO T_TBLGRNDETAILS (
                        DET_TYPE, DET_RUNNO, DET_COMCODE, DET_LINENO, 
                        DET_LOCFROM, DET_LOCTO, DET_SACODE,
                        DET_PROCODE, DET_STOCKCODE, DET_PRODESC, DET_UNIT,
                        DET_UNITQTY, DET_ADDTIONSQTY, DET_DEDUCTIONSQTY,
                        DET_CPRICE, DET_SPRICE, 
                        DET_DISCPER, DET_DISCAMT, DET_AMOUNT,
                        CR_DATE, CR_BY
                    ) VALUES (
                        '${header.type}', '${header.runNo}', '${header.comCode}', ${detail.lineNo},
                        '${header.locFrom}', '${header.locTo || ''}', '${detail.saCode || ''}',
                        '${detail.proCode}', '${detail.stockCode}', '${detail.proDesc}', '${detail.unit}',
                        ${detail.unitQty}, ${detail.additionsQty || 0}, ${detail.deductionsQty || 0},
                        ${detail.cPrice}, ${detail.sPrice},
                        ${detail.discPer}, ${detail.discAmt}, ${detail.amount},
                        GETDATE(), '${currentUser}'
                    )
                `);
            }

            await transaction.commit();
            
            return {
                success: true,
                message: 'GRN updated successfully',
                data: { runNo: header.runNo }
            };
        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error('Error in updateGRN service:', error);
            throw error;
        }
    }

    // Recalculate PO fully-used flag based on received GRN quantities
    async updatePOFullyUsed(refType, refNo, comCode, modifiedBy = 'SYSTEM') {
        if (!refType || !refNo || !comCode) {
            return { success: false, message: 'Missing PO reference data' };
        }

        if (refType.toUpperCase() !== 'PO') {
            return { success: false, message: 'Reference type is not PO; skipping fully-used update' };
        }

        // Read PO details
        const poDetailsResult = await query(`
            SELECT DET_PROCODE, DET_UNITQTY
            FROM T_TBLPODETAILS
            WHERE DET_RUNNO = @refNo AND DET_TYPE = @refType AND DET_COMCODE = @comCode
        `, [
            { name: 'refNo', value: refNo, type: sql.NVarChar(13) },
            { name: 'refType', value: refType, type: sql.NVarChar(3) },
            { name: 'comCode', value: comCode, type: sql.NVarChar(5) }
        ]);

        if (!poDetailsResult.recordset || poDetailsResult.recordset.length === 0) {
            return { success: false, message: 'PO detail records not found' };
        }

        // Sum received qty from all processed GRNs referencing this PO
        const grnReceiptResult = await query(`
            SELECT d.DET_PROCODE, SUM(d.DET_UNITQTY) AS ReceivedQty
            FROM T_TBLGRNDETAILS d
            INNER JOIN T_TBLGRNHEADER h ON h.HED_RUNNO = d.DET_RUNNO AND h.HED_TYPE = d.DET_TYPE AND h.HED_COMCODE = d.DET_COMCODE AND h.HED_LOCFROM = d.DET_LOCFROM
            WHERE h.HED_REFTYPE = @refType
              AND h.HED_REFNO = @refNo
              AND h.HED_COMCODE = @comCode
              AND h.HED_PROCESSED = 1
              AND h.HED_CANCELLED = 0
            GROUP BY d.DET_PROCODE
        `, [
            { name: 'refType', value: refType, type: sql.NVarChar(3) },
            { name: 'refNo', value: refNo, type: sql.NVarChar(13) },
            { name: 'comCode', value: comCode, type: sql.NVarChar(5) }
        ]);

        const receivedMap = (grnReceiptResult.recordset || []).reduce((map, row) => {
            map[row.DET_PROCODE] = parseFloat(row.ReceivedQty) || 0;
            return map;
        }, {});

        let isFullyUsed = true;

        for (const poLine of poDetailsResult.recordset) {
            const poQty = parseFloat(poLine.DET_UNITQTY) || 0;
            const receivedQty = receivedMap[poLine.DET_PROCODE] || 0;

            if (receivedQty < poQty) {
                isFullyUsed = false;
                break;
            }
        }

        await query(`
            UPDATE T_TBLPOHEADER
            SET HED_FULLYUSED = @fullyUsed,
                MD_DATE = GETDATE(),
                MD_BY = @modifiedBy
            WHERE HED_RUNNO = @refNo AND HED_TYPE = @refType AND HED_COMCODE = @comCode
        `, [
            { name: 'fullyUsed', value: isFullyUsed ? 1 : 0, type: sql.Bit },
            { name: 'modifiedBy', value: modifiedBy, type: sql.NVarChar(10) },
            { name: 'refNo', value: refNo, type: sql.NVarChar(13) },
            { name: 'refType', value: refType, type: sql.NVarChar(3) },
            { name: 'comCode', value: comCode, type: sql.NVarChar(5) }
        ]);

        return { success: true, fullyUsed: isFullyUsed };
    }

    // Process GRN (Update Inventory)
    async processDocument(type, runNo, comCode, locFrom, currentUser) {
        try {
            // First check if the document exists and is not already processed
            const docResult = await executeStoredProcedure('sp_GRN_GetByDocNo', [
                { name: 'type', value: type, type: sql.NVarChar(3) },
                { name: 'runNo', value: runNo, type: sql.NVarChar(13) },
                { name: 'comCode', value: comCode, type: sql.NVarChar(5) },
                { name: 'locFrom', value: locFrom, type: sql.NVarChar(5) }
            ]);

            if (!docResult.recordset || docResult.recordset.length === 0) {
                throw new Error('GRN document not found');
            }

            const header = docResult.recordset[0];
            if (header.HED_PROCESSED) {
                throw new Error('GRN is already processed');
            }

            const result = await executeStoredProcedure('sp_GRN_Process', [
                { name: 'type', value: type, type: sql.NVarChar(3) },
                { name: 'runNo', value: runNo, type: sql.NVarChar(13) },
                { name: 'comCode', value: comCode, type: sql.NVarChar(5) },
                { name: 'locFrom', value: locFrom, type: sql.NVarChar(5) },
                { name: 'modifiedBy', value: currentUser, type: sql.NVarChar(10) }
            ]);

            // Check if the stored procedure returned success
            if (result.recordset && result.recordset.length > 0) {
                const spResult = result.recordset[0];
                console.log('GRN Process SP Result:', spResult); // Debug log
                
                if (spResult.Success === 0) {
                    const errorMessage = spResult.Message || 'GRN processing failed due to business rule validation. Please check the document details and try again.';
                    throw new Error(errorMessage);
                }

                // Update linked PO fully used flag if this GRN references a PO
                try {
                    const updateResult = await this.updatePOFullyUsed(header.HED_REFTYPE, header.HED_REFNO, header.HED_COMCODE, currentUser);
                    console.log('PO fully used update:', updateResult);
                } catch (poUpdateError) {
                    console.error('Error updating PO HED_FULLYUSED status:', poUpdateError);
                }
                
                return {
                    success: true,
                    message: spResult.Message || 'GRN processed and inventory updated successfully',
                    data: spResult
                };
            } else {
                console.log('No recordset returned from GRN Process SP'); // Debug log
                throw new Error('No response from processing stored procedure');
            }
        } catch (error) {
            console.error('Error in processDocument:', error);
            throw error;
        }
    }

    // Get document by ID
    async getDocumentByNo(type, runNo, comCode, locFrom) {
        try {
            const result = await executeStoredProcedure('sp_GRN_GetByDocNo', [
                { name: 'type', value: type, type: sql.NVarChar(3) },
                { name: 'runNo', value: runNo, type: sql.NVarChar(13) },
                { name: 'comCode', value: comCode, type: sql.NVarChar(5) },
                { name: 'locFrom', value: locFrom, type: sql.NVarChar(5) }
            ]);

            if (result.recordsets[0].length === 0) {
                return null;
            }

            return {
                header: new GRNHeader(result.recordsets[0][0]),
                details: result.recordsets[1].map(row => new GRNDetail(row))
            };
        } catch (error) {
            console.error('Error in getDocumentByNo:', error);
            throw error;
        }
    }

    // Cancel GRN document: only if not processed and not already cancelled
    async cancelDocument(type, runNo, comCode, locFrom, currentUser) {
        try {
            const doc = await this.getDocumentByNo(type, runNo, comCode, locFrom);

            if (!doc) {
                throw new Error('GRN document not found');
            }

            if (doc.header.processed) {
                throw new Error('Processed documents cannot be cancelled');
            }

            if (doc.header.cancelled) {
                return {
                    success: true,
                    message: 'Document already cancelled',
                    data: { type, runNo, comCode, locFrom }
                };
            }

            await query(`
                UPDATE T_TBLGRNHEADER
                SET HED_CANCELLED = 1,
                    MD_DATE = GETDATE(),
                    MD_BY = @modifiedBy
                WHERE HED_TYPE = @type
                  AND HED_RUNNO = @runNo
                  AND HED_COMCODE = @comCode
                  AND HED_LOCFROM = @locFrom
            `, [
                { name: 'type', value: type, type: sql.NVarChar(3) },
                { name: 'runNo', value: runNo, type: sql.NVarChar(13) },
                { name: 'comCode', value: comCode, type: sql.NVarChar(5) },
                { name: 'locFrom', value: locFrom, type: sql.NVarChar(5) },
                { name: 'modifiedBy', value: currentUser || 'SYSTEM', type: sql.NVarChar(10) }
            ]);

            return {
                success: true,
                message: 'Document cancelled successfully',
                data: { type, runNo, comCode, locFrom }
            };
        } catch (error) {
            console.error('Error in cancelDocument:', error);
            throw error;
        }
    }

    // Search documents
    async searchDocuments(criteria) {
        try {
            const searchCriteria = new GRNSearchCriteria(criteria);

            const result = await executeStoredProcedure('sp_GRN_Search', [
                { name: 'searchText', value: searchCriteria.searchText, type: sql.NVarChar(100) },
                { name: 'type', value: searchCriteria.type, type: sql.NVarChar(3) },
                { name: 'fromDate', value: searchCriteria.fromDate, type: sql.Date },
                { name: 'toDate', value: searchCriteria.toDate, type: sql.Date },
                { name: 'supCode', value: searchCriteria.supCode, type: sql.NVarChar(10) },
                { name: 'processed', value: searchCriteria.processed, type: sql.Bit },
                { name: 'page', value: searchCriteria.page, type: sql.Int },
                { name: 'pageSize', value: searchCriteria.pageSize, type: sql.Int }
            ]);

            const documents = result.recordset.map(row => new GRNHeader(row));

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
            doc.fontSize(20).text('GOODS RECEIVED NOTE', { align: 'center' });
            doc.moveDown();
            
            doc.fontSize(10);
            doc.text(`Document No: ${header.runNo}`, 50, 100);
            doc.text(`Date: ${new Date(header.txnDate).toLocaleDateString()}`, 50, 115);
            doc.text(`Supplier: ${header.supCode} - ${header.supName || ''}`, 50, 130);
            doc.text(`PO Reference: ${header.refNo || 'N/A'}`, 50, 145);
            doc.text(`Location: ${header.locFrom}`, 300, 100);
            doc.text(`Status: ${header.processed ? 'Processed' : (header.cancelled ? 'Cancelled' : 'Pending')}`, 300, 115);

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
            doc.text('Qty', qtyX, tableTop);
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

module.exports = new GRNService();