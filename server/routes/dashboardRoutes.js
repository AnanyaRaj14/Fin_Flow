const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getDashboardStats, getChartData, getReport } = require('../controllers/dashboardController');

router.use(protect);

router.get('/', getDashboardStats);
router.get('/charts', getChartData);
router.get('/reports', getReport);

module.exports = router;
