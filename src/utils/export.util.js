const { Parser } = require('json2csv');

class ExportUtil {
    // Export data to CSV
    exportToCSV(data, fields, fileName = 'export') {
        try {
            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(data);
            
            // Add BOM for Excel compatibility
            const csvWithBOM = '\uFEFF' + csv;
            
            return {
                csv: csvWithBOM,
                headers: {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': `attachment; filename="${fileName}_${Date.now()}.csv"`
                }
            };
        } catch (error) {
            throw new Error(`CSV export failed: ${error.message}`);
        }
    }

    // Generate user export fields
    getUserExportFields() {
        return [
            { label: 'User ID', value: 'userId' },
            { label: 'Full Name', value: 'fullName' },
            { label: 'NIC', value: 'nic' },
            { label: 'Gender', value: 'gender' },
            { label: 'Date of Birth', value: 'dob' },
            { label: 'Mobile', value: 'mobile' },
            { label: 'Email', value: 'email' },
            { label: 'User Group', value: 'userGroup' },
            { label: 'Designation', value: 'designation' },
            { label: 'Address', value: 'address' },
            { label: 'Status', value: 'status', format: (v) => v ? 'Active' : 'Inactive' },
            { label: 'Created Date', value: 'createdDate' },
            { label: 'Created By', value: 'createdBy' }
        ];
    }
}

module.exports = new ExportUtil();