const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getAccounts, createAccount, updateAccount, deleteAccount } = require('../controllers/accountController');

router.use(protect);

router.get('/', getAccounts);
router.post('/', createAccount);
router.put('/:id', updateAccount);
router.delete('/:id', deleteAccount);

module.exports = router;
