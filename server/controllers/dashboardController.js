const prisma = require('../config/db');

// GET /api/dashboard
const getDashboardStats = async (req, res) => {
  const userId = req.user.id;
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Date range for current month
  const monthStart = new Date(currentYear, currentMonth - 1, 1);
  const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);

  const [accounts, monthlyTx, recentTx, bills, budgets, goals] = await Promise.all([
    prisma.account.findMany({ where: { userId } }),

    prisma.transaction.findMany({
      where: { userId, date: { gte: monthStart, lte: monthEnd } },
      include: { category: true },
    }),

    prisma.transaction.findMany({
      where: { userId },
      include: { category: true, account: true },
      orderBy: { date: 'desc' },
      take: 5,
    }),

    prisma.bill.findMany({
      where: { userId },
      orderBy: { dueDate: 'asc' },
      take: 5,
    }),

    prisma.budget.findMany({
      where: { userId, month: currentMonth, year: currentYear },
      include: { category: true },
    }),

    prisma.goal.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } }),
  ]);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const totalIncome = monthlyTx.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = monthlyTx.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalSavings = totalIncome - totalExpenses;

  // Budget remaining
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const remainingBudget = totalBudgeted - totalSpent;

  // Upcoming bills (next 7 days)
  const today = now.getDate();
  const upcomingBills = bills.filter((b) => !b.isPaid && b.dueDate >= today && b.dueDate <= today + 7);

  res.json({
    totalBalance,
    totalIncome,
    totalExpenses,
    totalSavings,
    remainingBudget,
    recentTransactions: recentTx,
    upcomingBills,
    budgets,
    goals,
  });
};

// GET /api/dashboard/charts
const getChartData = async (req, res) => {
  const userId = req.user.id;
  const year = parseInt(req.query.year) || new Date().getFullYear();

  // Monthly income vs expense for the year
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: new Date(year, 0, 1),
        lte: new Date(year, 11, 31, 23, 59, 59),
      },
    },
    include: { category: true },
  });

  // Build monthly data
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(year, i, 1).toLocaleString('default', { month: 'short' }),
    income: 0,
    expense: 0,
  }));

  transactions.forEach((t) => {
    const m = new Date(t.date).getMonth();
    if (t.type === 'income') months[m].income += t.amount;
    else months[m].expense += t.amount;
  });

  // Expenses by category (current month)
  const now = new Date();
  const currentMonthTx = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === year && t.type === 'expense';
  });

  const categoryMap = {};
  currentMonthTx.forEach((t) => {
    const name = t.category?.name || 'Other';
    const color = t.category?.color || '#6b7280';
    if (!categoryMap[name]) categoryMap[name] = { name, value: 0, color };
    categoryMap[name].value += t.amount;
  });

  // Savings trend (monthly)
  const savingsTrend = months.map((m) => ({
    month: m.month,
    savings: parseFloat((m.income - m.expense).toFixed(2)),
  }));

  // Daily spending for current month
  const currentMonthExpenses = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === year && t.type === 'expense';
  });

  const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate();
  const dailySpending = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    amount: 0,
  }));
  currentMonthExpenses.forEach((t) => {
    const day = new Date(t.date).getDate() - 1;
    if (dailySpending[day]) dailySpending[day].amount += t.amount;
  });
  dailySpending.forEach((d) => { d.amount = parseFloat(d.amount.toFixed(2)); });

  res.json({
    monthlyData: months,
    expensesByCategory: Object.values(categoryMap),
    savingsTrend,
    dailySpending,
  });
};

// GET /api/dashboard/reports?type=monthly&month=&year= or type=yearly&year=
const getReport = async (req, res) => {
  const userId = req.user.id;
  const { type, month, year } = req.query;

  let start, end;
  if (type === 'yearly') {
    start = new Date(parseInt(year), 0, 1);
    end = new Date(parseInt(year), 11, 31, 23, 59, 59);
  } else {
    start = new Date(parseInt(year), parseInt(month) - 1, 1);
    end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
  }

  const transactions = await prisma.transaction.findMany({
    where: { userId, date: { gte: start, lte: end } },
    include: { category: true, account: true },
    orderBy: { date: 'asc' },
  });

  const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  res.json({ transactions, summary: { income, expenses, savings: income - expenses } });
};

module.exports = { getDashboardStats, getChartData, getReport };
