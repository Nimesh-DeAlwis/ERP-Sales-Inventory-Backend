const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
    validateCreateProduct, 
    validateUpdateProduct, 
    validateSearchProducts, 
    validateCheckDuplicate 
} = require('../validators/product.validator');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/products');
console.log('Upload directory absolute path:', uploadDir);

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Created upload directory:', uploadDir);
} else {
    console.log('Upload directory already exists:', uploadDir);
    // List existing files
    try {
        const files = fs.readdirSync(uploadDir);
    } catch (err) {
        console.error('Error reading upload directory:', err);
    }
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('Multer destination called, saving to:', uploadDir);
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const productCode = req.params.id;
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = `product-${productCode}-${uniqueSuffix}${ext}`;
        console.log('Generated filename:', filename);
        console.log('Full file path:', path.join(uploadDir, filename));
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
        
        console.log('File upload request for product:', req.params.id);
        console.log('File original name:', file.originalname);
        console.log('File mimetype:', file.mimetype);
        console.log('File extension:', path.extname(file.originalname));
        console.log('Mimetype valid:', mimetype);
        console.log('Extension valid:', extname);
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed'));
    }
});




// Public route - must come BEFORE auth middleware
router.get('/next-code', productController.getNextProductCode);

// Apply authentication middleware to all routes after public routes
const { authenticateToken, checkUserStatus } = require('../middleware/auth.middleware');

// Product routes
router.post('/', validateCreateProduct, productController.createProduct);
router.get('/search', validateSearchProducts, productController.searchProducts);
router.get('/check-duplicate', validateCheckDuplicate, productController.checkDuplicateProductCode);

// Inventory routes
router.get('/:id/inventory', productController.getProductInventory);
router.post('/inventory', productController.saveProductInventory);
router.delete('/inventory/:productCode/:locationCode', productController.deleteProductInventory);

// Supplier routes
router.get('/:id/suppliers', productController.getProductSuppliers);
router.post('/suppliers', productController.saveProductSupplier);
router.delete('/suppliers/:productCode/:locationCode/:supplierCode', productController.deleteProductSupplier);

// Picture upload
router.post('/:id/picture', upload.single('picture'), productController.uploadProductPicture);


// Basic CRUD
router.get('/:id', productController.getProductByCode);
router.put('/:id', validateUpdateProduct, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

console.log('Product routes loaded successfully');

module.exports = router;