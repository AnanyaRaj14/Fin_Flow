const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getBills, createBill, updateBill, deleteBill, togglePaid } = require('../controllers/billController');

router.use(protect);

router.get('/', getBills);
router.post('/', createBill);
router.put('/:id', updateBill);
router.delete('/:id', deleteBill);
router.post('/:id/toggle-paid', togglePaid);

module.exports = router;
