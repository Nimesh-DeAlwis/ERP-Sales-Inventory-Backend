const express = require('express');
const router = express.Router();
const pvcgrnController = require('../../../controllers/vouchers/physicalvoucher/pvcgrn.controller');
const { authenticateToken } = require('../../../middleware/auth.middleware');

router.use(authenticateToken);

router.get('/setup/:txType', pvcgrnController.getSetup);
router.get('/next-runno', pvcgrnController.getNextRunNo);
router.get('/po/:poType/:poRunNo', pvcgrnController.getPOByRunNo);
router.post('/', pvcgrnController.createGRN);
router.post('/:type/:runNo/process', pvcgrnController.processGRN);
router.post('/:type/:runNo/cancel', pvcgrnController.cancelGRN);
router.get('/:type/:runNo', pvcgrnController.getGRNByRunNo);
router.post('/search', pvcgrnController.searchGRN);

module.exports = router;