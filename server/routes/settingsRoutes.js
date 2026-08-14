const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getSettings, updateSettings } = require('../controllers/settingsController');

router.use(protect);

router.get('/', getSettings);
router.put('/', updateSettings);

module.exports = router;
