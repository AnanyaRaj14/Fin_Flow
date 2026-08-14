const prisma = require('../config/db');

// GET /api/accounts
const getAccounts = async (req, res) => {
  const accounts = await prisma.account.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'asc' },
  });
  res.json({ accounts });
};

// POST /api/accounts
const createAccount = async (req, res) => {
  const { name, type, balance, color, icon } = req.body;

  const account = await prisma.account.create({
    data: { name, type, balance: parseFloat(balance) || 0, color, icon, userId: req.user.id },
  });

  res.status(201).json({ account });
};

// PUT /api/accounts/:id
const updateAccount = async (req, res) => {
  const { name, type, color, icon } = req.body;

  const account = await prisma.account.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!account) return res.status(404).json({ message: 'Account not found.' });

  const updated = await prisma.account.update({
    where: { id: req.params.id },
    data: { name, type, color, icon },
  });

  res.json({ account: updated });
};

// DELETE /api/accounts/:id
const deleteAccount = async (req, res) => {
  const account = await prisma.account.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!account) return res.status(404).json({ message: 'Account not found.' });

  await prisma.account.delete({ where: { id: req.params.id } });
  res.json({ message: 'Account deleted.' });
};

module.exports = { getAccounts, createAccount, updateAccount, deleteAccount };
