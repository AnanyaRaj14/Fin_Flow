const prisma = require('../config/db');

// GET /api/budgets?month=&year=
const getBudgets = async (req, res) => {
  const month = parseInt(req.query.month) || new Date().getMonth() + 1;
  const year = parseInt(req.query.year) || new Date().getFullYear();

  const budgets = await prisma.budget.findMany({
    where: { userId: req.user.id, month, year },
    include: { category: true },
    orderBy: { createdAt: 'asc' },
  });

  res.json({ budgets });
};

// POST /api/budgets
const createBudget = async (req, res) => {
  const { categoryId, amount, month, year } = req.body;

  const budget = await prisma.budget.upsert({
    where: {
      userId_categoryId_month_year: {
        userId: req.user.id,
        categoryId,
        month: parseInt(month),
        year: parseInt(year),
      },
    },
    update: { amount: parseFloat(amount) },
    create: {
      categoryId,
      amount: parseFloat(amount),
      month: parseInt(month),
      year: parseInt(year),
      userId: req.user.id,
    },
    include: { category: true },
  });

  res.status(201).json({ budget });
};

// PUT /api/budgets/:id
const updateBudget = async (req, res) => {
  const { amount } = req.body;

  const budget = await prisma.budget.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!budget) return res.status(404).json({ message: 'Budget not found.' });

  const updated = await prisma.budget.update({
    where: { id: req.params.id },
    data: { amount: parseFloat(amount) },
    include: { category: true },
  });

  res.json({ budget: updated });
};

// DELETE /api/budgets/:id
const deleteBudget = async (req, res) => {
  const budget = await prisma.budget.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!budget) return res.status(404).json({ message: 'Budget not found.' });

  await prisma.budget.delete({ where: { id: req.params.id } });
  res.json({ message: 'Budget deleted.' });
};

module.exports = { getBudgets, createBudget, updateBudget, deleteBudget };
