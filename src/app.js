const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const session = require('express-session');
const path = require('path'); 
const fs = require('fs');
const routes = require('./routes');
require('dotenv').config(); 

const app = express();

// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
};
app.use(cors(corsOptions));
// Handle preflight requests
app.options('*', cors(corsOptions));

// Security, compression, and body-parsing middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" } // Allow cross-origin for images
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Setup uploads directory to be in `backend/uploads`, not `backend/src/uploads`
const uploadsDir = path.join(__dirname, '../uploads');

// Ensure directories exist
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from the correct `uploads` directory.
app.use('/uploads', express.static(uploadsDir));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Database connection
const db = require('./config/database');

// Test database connection
db.connect()
    .then(() => console.log('Database connected successfully'))
    .catch(err => console.error('Database connection error:', err));

// Routes
//user management routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/user-master', require('./routes/usermaster.routes'));
app.use('/api/user-groups', require('./routes/usergroup.routes'));
//master data routes
app.use('/api/locations', require('./routes/location.routes'));
app.use('/api/titles', require('./routes/title.routes'));
app.use('/api/masters/units', require('./routes/unit.routes'));
app.use('/api/masters/paymodes', require('./routes/paymode.routes'));
app.use('/api/customers/groups', require('./routes/customergroup.routes'));
//customer and supplier master routes
app.use('/api/customers/master', require('./routes/customer.routes'));
app.use('/api/suppliers/supplier-groups', require('./routes/suppliergroup.routes'));
app.use('/api/suppliers/master', require('./routes/supplier.routes'));
//product master routes
app.use('/api/products/department', require('./routes/department.routes'));
app.use('/api/products/subdepartment', require('./routes/subdepartment.routes'));
app.use('/api/products/brand', require('./routes/brand.routes'));
app.use('/api/products/master', require('./routes/product.routes'));
//transaction routes
app.use('/api/transactions/dir-grn', require('./routes/transaction/dirgrn.routes'));
app.use('/api/transactions/po', require('./routes/transaction/po.routes'));
app.use('/api/transactions/grn', require('./routes/transaction/grn.routes'));
app.use('/api/transactions/dwo', require('./routes/transaction/dwo.routes'));
app.use('/api/transactions/usg', require('./routes/transaction/usg.routes'));
app.use('/api/transactions/ver', require('./routes/transaction/ver.routes'));
app.use('/api/transactions/supr', require('./routes/transaction/supr.routes'));
//sale routes
app.use('/api/sales/quo', require('./routes/sales/quo.routes'));
app.use('/api/sales/coi', require('./routes/sales/coi.routes'));
app.use('/api/sales/cor', require('./routes/sales/cor.routes'));
console.log('All routes loaded successfully');


// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

module.exports = app;