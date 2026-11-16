const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', reportController.getAllReports);
router.get('/stats', reportController.getStats);
router.get('/:id', reportController.getReportById);
router.post('/', verifyToken, reportController.createReport);
router.patch('/:id/status', verifyToken, reportController.updateReportStatus);

module.exports = router;