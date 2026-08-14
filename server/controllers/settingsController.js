const prisma = require('../config/db');

// GET /api/settings
const getSettings = async (req, res) => {
  const settings = await prisma.settings.findUnique({
    where: { userId: req.user.id },
  });
  res.json({ settings });
};

// PUT /api/settings
const updateSettings = async (req, res) => {
  const { theme, currency } = req.body;

  const settings = await prisma.settings.upsert({
    where: { userId: req.user.id },
    update: { theme, currency },
    create: { theme, currency, userId: req.user.id },
  });

  res.json({ settings });
};

module.exports = { getSettings, updateSettings };
