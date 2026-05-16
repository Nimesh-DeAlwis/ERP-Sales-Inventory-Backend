const express = require('express');
const router = express.Router();
const multer = require('multer');
const pvcwriteoffController = require('../../../controllers/vouchers/physicalvoucher/pvcwriteoff.controller');
const { authenticateToken } = require('../../../middleware/auth.middleware');

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.use(authenticateToken);

router.get('/next-runno', pvcwriteoffController.getNextRunNo);
router.get('/vouchers/search', pvcwriteoffController.searchVouchers);
router.post('/', pvcwriteoffController.createWriteOff);
router.post('/search', pvcwriteoffController.searchWriteOff);
router.get('/template/download', pvcwriteoffController.downloadTemplate);
router.post('/upload', upload.single('file'), pvcwriteoffController.uploadExcel);
router.get('/:type/:runNo', pvcwriteoffController.getWriteOffByRunNo);

module.exports = router;