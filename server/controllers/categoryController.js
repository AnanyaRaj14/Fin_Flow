const prisma = require('../config/db');

// GET /api/categories
const getCategories = async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { userId: req.user.id },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  });
  res.json({ categories });
};

// POST /api/categories
const createCategory = async (req, res) => {
  const { name, icon, color, type } = req.body;

  const category = await prisma.category.create({
    data: { name, icon, color, type, userId: req.user.id, isDefault: false },
  });

  res.status(201).json({ category });
};

// PUT /api/categories/:id
const updateCategory = async (req, res) => {
  const { name, icon, color, type } = req.body;

  const category = await prisma.category.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!category) return res.status(404).json({ message: 'Category not found.' });
  if (category.isDefault) return res.status(400).json({ message: 'Default categories cannot be edited.' });

  const updated = await prisma.category.update({
    where: { id: req.params.id },
    data: { name, icon, color, type },
  });

  res.json({ category: updated });
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  const category = await prisma.category.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!category) return res.status(404).json({ message: 'Category not found.' });
  if (category.isDefault) return res.status(400).json({ message: 'Default categories cannot be deleted.' });

  await prisma.category.delete({ where: { id: req.params.id } });
  res.json({ message: 'Category deleted.' });
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
