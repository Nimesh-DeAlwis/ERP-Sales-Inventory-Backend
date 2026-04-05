const { sql } = require('../config/database');

class TypeHelper {
    static getSqlType(value, defaultValue = null) {
        if (value === null || value === undefined) {
            return defaultValue || sql.NVarChar;
        }
        
        switch (typeof value) {
            case 'number':
                return Number.isInteger(value) ? sql.Int : sql.Decimal;
            case 'boolean':
                return sql.Bit;
            case 'string':
                // Check if it's a date string
                if (!isNaN(Date.parse(value))) {
                    return sql.DateTime;
                }
                // Check if it's numeric string
                if (!isNaN(value) && value.trim() !== '') {
                    return sql.Decimal;
                }
                return sql.NVarChar;
            case 'object':
                if (value instanceof Date) {
                    return sql.DateTime;
                }
                return sql.NVarChar;
            default:
                return sql.NVarChar;
        }
    }
    
    static formatValueForSql(value, type) {
        if (value === null || value === undefined) {
            return null;
        }
        
        switch (type) {
            case sql.Bit:
                return value === true || value === 1 || value === 'true' || value === '1';
            case sql.Int:
            case sql.BigInt:
            case sql.SmallInt:
                const intVal = parseInt(value);
                return isNaN(intVal) ? 0 : intVal;
            case sql.Decimal:
            case sql.Float:
            case sql.Numeric:
                const floatVal = parseFloat(value);
                return isNaN(floatVal) ? 0 : floatVal;
            case sql.DateTime:
            case sql.Date:
                if (value instanceof Date) {
                    return value;
                }
                const dateVal = new Date(value);
                return isNaN(dateVal.getTime()) ? null : dateVal;
            default:
                return value.toString();
        }
    }
}

module.exports = TypeHelper;