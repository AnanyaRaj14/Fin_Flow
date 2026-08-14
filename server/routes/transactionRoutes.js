const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadReceipt } = require('../middleware/upload');
const { getTransactions, getTransaction, createTransaction, updateTransaction, deleteTransaction } = require('../controllers/transactionController');

router.use(protect);

router.get('/', getTransactions);
router.get('/:id', getTransaction);
router.post('/', uploadReceipt.single('receipt'), createTransaction);
router.put('/:id', uploadReceipt.single('receipt'), updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
