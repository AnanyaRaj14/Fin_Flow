const prisma = require('../config/db');

// GET /api/goals
const getGoals = async (req, res) => {
  const goals = await prisma.goal.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'asc' },
  });
  res.json({ goals });
};

// POST /api/goals
const createGoal = async (req, res) => {
  const { name, targetAmount, savedAmount, deadline, icon, color } = req.body;

  const goal = await prisma.goal.create({
    data: {
      name,
      targetAmount: parseFloat(targetAmount),
      savedAmount: parseFloat(savedAmount) || 0,
      deadline: deadline ? new Date(deadline) : null,
      icon,
      color,
      userId: req.user.id,
    },
  });

  res.status(201).json({ goal });
};

// PUT /api/goals/:id
const updateGoal = async (req, res) => {
  const { name, targetAmount, savedAmount, deadline, icon, color } = req.body;

  const goal = await prisma.goal.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!goal) return res.status(404).json({ message: 'Goal not found.' });

  const newSaved = parseFloat(savedAmount);
  const newTarget = parseFloat(targetAmount);
  const isCompleted = newSaved >= newTarget;

  const updated = await prisma.goal.update({
    where: { id: req.params.id },
    data: {
      name,
      targetAmount: newTarget,
      savedAmount: newSaved,
      deadline: deadline ? new Date(deadline) : null,
      icon,
      color,
      isCompleted,
    },
  });

  res.json({ goal: updated });
};

// DELETE /api/goals/:id
const deleteGoal = async (req, res) => {
  const goal = await prisma.goal.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!goal) return res.status(404).json({ message: 'Goal not found.' });

  await prisma.goal.delete({ where: { id: req.params.id } });
  res.json({ message: 'Goal deleted.' });
};

module.exports = { getGoals, createGoal, updateGoal, deleteGoal };
