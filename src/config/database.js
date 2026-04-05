const sql = require('mssql');

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT),
    options: {
        encrypt: true,
        trustServerCertificate: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool;

const connect = async () => {
    try {
        pool = await sql.connect(config);
        return pool;
    } catch (err) {
        console.error('Database connection failed:', err);
        throw err;
    }
};

const getPool = () => {
    if (!pool) {
        throw new Error('Database not connected. Call connect() first.');
    }
    return pool;
};

const query = async (queryText, params = []) => {
    const pool = getPool();
    const request = pool.request();
    
    params.forEach((param, index) => {
        if (param.value !== undefined && param.value !== null) {
            request.input(param.name, param.type || sql.NVarChar, param.value);
        }
    });
    
    return await request.query(queryText);
};

const executeStoredProcedure = async (procedureName, params = []) => {
    const pool = getPool();
    const request = pool.request();
    
    params.forEach((param) => {
        if (param.value !== undefined && param.value !== null) {
            // Convert value based on type
            let value = param.value;
            let type = param.type || sql.NVarChar;
            
            // Handle boolean conversion for SQL Server BIT type
            if (type === sql.Bit) {
                value = value === true || value === 1 || value === 'true' || value === '1';
            }
            // Handle integer conversion
            else if (type === sql.Int || type === sql.BigInt || type === sql.SmallInt) {
                value = parseInt(value);
                if (isNaN(value)) value = 0;
            }
            // Handle float/decimal conversion
            else if (type === sql.Decimal || type === sql.Float || type === sql.Numeric) {
                value = parseFloat(value);
                if (isNaN(value)) value = 0;
            }
            
            request.input(param.name, type, value);
        }
    });
    
    return await request.execute(procedureName);
};



module.exports = {
    connect,
    getPool,
    query,
    executeStoredProcedure,
    sql
};