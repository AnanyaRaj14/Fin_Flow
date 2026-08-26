const prisma = require('../config/db');
const { getPresignedUrl } = require('../utils/s3Presigner');

// GET /api/transactions
const getTransactions = async (req, res) => {
  const { search, categoryId, accountId, type, startDate, endDate, sortBy = 'date', sortOrder = 'desc', page = 1, limit = 20 } = req.query;

  const where = { userId: req.user.id };

  if (search) where.title = { contains: search, mode: 'insensitive' };
  if (categoryId) where.categoryId = categoryId;
  if (accountId) where.accountId = accountId;
  if (type) where.type = type;
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { category: true, account: true },
      orderBy: { [sortBy]: sortOrder },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    }),
    prisma.transaction.count({ where }),
  ]);

  const signedTransactions = await Promise.all(
    transactions.map(async (t) => {
      if (t.receiptUrl) {
        return { ...t, receiptUrl: await getPresignedUrl(t.receiptUrl) };
      }
      return t;
    })
  );

  res.json({ transactions: signedTransactions, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
};

// GET /api/transactions/:id
const getTransaction = async (req, res) => {
  const transaction = await prisma.transaction.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: { category: true, account: true },
  });
  if (!transaction) return res.status(404).json({ message: 'Transaction not found.' });
  if (transaction.receiptUrl) {
    transaction.receiptUrl = await getPresignedUrl(transaction.receiptUrl);
  }
  res.json({ transaction });
};

// POST /api/transactions
const createTransaction = async (req, res) => {
  const { title, amount, type, date, categoryId, accountId, paymentMethod, notes } = req.body;
  const receiptUrl = req.file?.location || null; // multer-s3 uses 'location' instead of 'path'

  const parsedAmount = parseFloat(amount);

  const transaction = await prisma.transaction.create({
    data: {
      title,
      amount: parsedAmount,
      type,
      date: new Date(date),
      categoryId,
      accountId,
      paymentMethod,
      notes,
      receiptUrl,
      userId: req.user.id,
    },
    include: { category: true, account: true },
  });

  // Update account balance
  await prisma.account.update({
    where: { id: accountId },
    data: {
      balance: { increment: type === 'income' ? parsedAmount : -parsedAmount },
    },
  });

  // Update budget spent amount if it's an expense
  if (type === 'expense') {
    const txDate = new Date(date);
    await prisma.budget.updateMany({
      where: {
        userId: req.user.id,
        categoryId,
        month: txDate.getMonth() + 1,
        year: txDate.getFullYear(),
      },
      data: { spent: { increment: parsedAmount } },
    });
  }

  if (transaction.receiptUrl) {
    transaction.receiptUrl = await getPresignedUrl(transaction.receiptUrl);
  }

  res.status(201).json({ transaction });
};

// PUT /api/transactions/:id
const updateTransaction = async (req, res) => {
  const { title, amount, type, date, categoryId, accountId, paymentMethod, notes } = req.body;
  const receiptUrl = req.file?.location || undefined; // multer-s3 uses 'location' instead of 'path'

  const existing = await prisma.transaction.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!existing) return res.status(404).json({ message: 'Transaction not found.' });

  // Reverse old balance effect
  await prisma.account.update({
    where: { id: existing.accountId },
    data: {
      balance: { increment: existing.type === 'income' ? -existing.amount : existing.amount },
    },
  });

  // Reverse old budget effect
  if (existing.type === 'expense') {
    const oldDate = new Date(existing.date);
    await prisma.budget.updateMany({
      where: {
        userId: req.user.id,
        categoryId: existing.categoryId,
        month: oldDate.getMonth() + 1,
        year: oldDate.getFullYear(),
      },
      data: { spent: { decrement: existing.amount } },
    });
  }

  const parsedAmount = parseFloat(amount);
  const data = { title, amount: parsedAmount, type, date: new Date(date), categoryId, accountId, paymentMethod, notes };
  if (receiptUrl) data.receiptUrl = receiptUrl;

  const transaction = await prisma.transaction.update({
    where: { id: req.params.id },
    data,
    include: { category: true, account: true },
  });

  // Apply new balance effect
  await prisma.account.update({
    where: { id: accountId },
    data: {
      balance: { increment: type === 'income' ? parsedAmount : -parsedAmount },
    },
  });

  // Apply new budget effect
  if (type === 'expense') {
    const newDate = new Date(date);
    await prisma.budget.updateMany({
      where: {
        userId: req.user.id,
        categoryId,
        month: newDate.getMonth() + 1,
        year: newDate.getFullYear(),
      },
      data: { spent: { increment: parsedAmount } },
    });
  }

  if (transaction.receiptUrl) {
    transaction.receiptUrl = await getPresignedUrl(transaction.receiptUrl);
  }

  res.json({ transaction });
};

// DELETE /api/transactions/:id
const deleteTransaction = async (req, res) => {
  const transaction = await prisma.transaction.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!transaction) return res.status(404).json({ message: 'Transaction not found.' });

  await prisma.transaction.delete({ where: { id: req.params.id } });

  // Reverse balance
  await prisma.account.update({
    where: { id: transaction.accountId },
    data: {
      balance: { increment: transaction.type === 'income' ? -transaction.amount : transaction.amount },
    },
  });

  // Reverse budget
  if (transaction.type === 'expense') {
    const txDate = new Date(transaction.date);
    await prisma.budget.updateMany({
      where: {
        userId: req.user.id,
        categoryId: transaction.categoryId,
        month: txDate.getMonth() + 1,
        year: txDate.getFullYear(),
      },
      data: { spent: { decrement: transaction.amount } },
    });
  }

  res.json({ message: 'Transaction deleted.' });
};

module.exports = { getTransactions, getTransaction, createTransaction, updateTransaction, deleteTransaction };
