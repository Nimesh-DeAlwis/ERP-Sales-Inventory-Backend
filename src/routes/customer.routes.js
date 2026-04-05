const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const authMiddleware = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
    validateCreateCustomer, 
    validateUpdateCustomer, 
    validateSearchCustomers, 
    validateCheckDuplicate 
} = require('../validators/customer.validator');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/customers');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Created upload directory:', uploadDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const customerCode = req.params.id;
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        // Make sure filename isn't too long (NVARCHAR(50) in DB)
        const filename = `cust-${customerCode}-${uniqueSuffix}${ext}`;
        console.log('Generated filename:', filename);
        cb(null, filename);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed'));
    }
});

// IMPORTANT: Public route (no auth required) - must come BEFORE auth middleware
router.get('/next-code', customerController.getNextCustomerCode);

// Apply authentication middleware to all routes AFTER public routes
const { authenticateToken, checkUserStatus } = require('../middleware/auth.middleware');

// Customer routes - ORDER MATTERS!
router.post('/:id/photo', upload.single('photo'), customerController.uploadCustomerPhoto);
router.post('/', validateCreateCustomer, customerController.createCustomer);
router.get('/search', validateSearchCustomers, customerController.searchCustomers);
router.get('/check-duplicate', validateCheckDuplicate, customerController.checkDuplicateCustomerCode);
router.get('/:id', customerController.getCustomerByCode);
router.put('/:id', validateUpdateCustomer, customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);


module.exports = router;