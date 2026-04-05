const express = require('express');
const router = express.Router();
const titleController = require('../controllers/title.controller');
const {
    validateCreateTitle,
    validateUpdateTitle,
    validateSearchTitles,
    validateCheckDuplicate
} = require('../validators/title.validator');
const { authenticateToken, checkUserStatus } = require('../middleware/auth.middleware');


// Public endpoints (no auth required for dropdowns)
router.get('/active', titleController.getAllActiveTitles);
router.get('/dropdown', titleController.getTitlesForDropdown);

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(checkUserStatus);

// Title CRUD operations
router.post('/', validateCreateTitle, titleController.createTitle);
router.get('/', validateSearchTitles, titleController.getAllTitles);
router.get('/check-duplicate', validateCheckDuplicate, titleController.checkDuplicateTitleCode);



// Title specific operations
router.get('/:id', titleController.getTitleById);
router.put('/:id', validateUpdateTitle, titleController.updateTitle);
router.delete('/:id', titleController.deleteTitle);

module.exports = router;