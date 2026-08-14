const prisma = require('../config/db');

// GET /api/bills
const getBills = async (req, res) => {
  const bills = await prisma.bill.findMany({
    where: { userId: req.user.id },
    orderBy: { dueDate: 'asc' },
  });
  res.json({ bills });
};

// POST /api/bills
const createBill = async (req, res) => {
  const { name, amount, dueDate, isRecurring, category, icon, color } = req.body;

  const bill = await prisma.bill.create({
    data: {
      name,
      amount: parseFloat(amount),
      dueDate: parseInt(dueDate),
      isRecurring: isRecurring ?? true,
      category,
      icon,
      color,
      userId: req.user.id,
    },
  });

  res.status(201).json({ bill });
};

// PUT /api/bills/:id
const updateBill = async (req, res) => {
  const { name, amount, dueDate, isPaid, isRecurring, category, icon, color } = req.body;

  const bill = await prisma.bill.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!bill) return res.status(404).json({ message: 'Bill not found.' });

  const updated = await prisma.bill.update({
    where: { id: req.params.id },
    data: {
      name,
      amount: parseFloat(amount),
      dueDate: parseInt(dueDate),
      isPaid,
      isRecurring,
      category,
      icon,
      color,
      paidAt: isPaid && !bill.isPaid ? new Date() : bill.paidAt,
    },
  });

  res.json({ bill: updated });
};

// DELETE /api/bills/:id
const deleteBill = async (req, res) => {
  const bill = await prisma.bill.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!bill) return res.status(404).json({ message: 'Bill not found.' });

  await prisma.bill.delete({ where: { id: req.params.id } });
  res.json({ message: 'Bill deleted.' });
};

// POST /api/bills/:id/toggle-paid
const togglePaid = async (req, res) => {
  const bill = await prisma.bill.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!bill) return res.status(404).json({ message: 'Bill not found.' });

  const updated = await prisma.bill.update({
    where: { id: req.params.id },
    data: {
      isPaid: !bill.isPaid,
      paidAt: !bill.isPaid ? new Date() : null,
    },
  });

  res.json({ bill: updated });
};

module.exports = { getBills, createBill, updateBill, deleteBill, togglePaid };
