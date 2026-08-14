/**
 * Prisma seed — creates a demo user with sample data so you can
 * log in immediately without going through email verification.
 *
 * Run: npx prisma db seed
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const defaultCategories = [
  { name: 'Salary',        icon: 'briefcase',       color: '#10b981', type: 'income',  isDefault: true },
  { name: 'Investment',    icon: 'trending-up',     color: '#6366f1', type: 'income',  isDefault: true },
  { name: 'Food',          icon: 'utensils',        color: '#f59e0b', type: 'expense', isDefault: true },
  { name: 'Shopping',      icon: 'shopping-bag',    color: '#ec4899', type: 'expense', isDefault: true },
  { name: 'Travel',        icon: 'plane',           color: '#3b82f6', type: 'expense', isDefault: true },
  { name: 'Bills',         icon: 'receipt',         color: '#ef4444', type: 'expense', isDefault: true },
  { name: 'Health',        icon: 'heart',           color: '#14b8a6', type: 'expense', isDefault: true },
  { name: 'Entertainment', icon: 'film',            color: '#8b5cf6', type: 'expense', isDefault: true },
  { name: 'Others',        icon: 'more-horizontal', color: '#6b7280', type: 'both',    isDefault: true },
];

async function main() {
  console.log('Seeding database...');

  const existing = await prisma.user.findUnique({ where: { email: 'demo@finflow.app' } });
  if (existing) {
    console.log('Demo user already exists. Skipping seed.');
    return;
  }

  const password = await bcrypt.hash('Demo@1234', 12);

  const user = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@finflow.app',
      password,
      isVerified: true,
    },
  });

  // Default categories
  const categories = await Promise.all(
    defaultCategories.map((c) =>
      prisma.category.create({ data: { ...c, userId: user.id } })
    )
  );

  const catMap = Object.fromEntries(categories.map((c) => [c.name, c.id]));

  // Accounts
  const checking = await prisma.account.create({
    data: { name: 'Main Checking', type: 'bank', balance: 4850, color: '#6366f1', icon: 'building', userId: user.id },
  });
  const savings = await prisma.account.create({
    data: { name: 'Savings', type: 'bank', balance: 12000, color: '#10b981', icon: 'piggy-bank', userId: user.id },
  });
  const cash = await prisma.account.create({
    data: { name: 'Cash Wallet', type: 'cash', balance: 240, color: '#f59e0b', icon: 'banknote', userId: user.id },
  });

  // Transactions — last 3 months
  const now = new Date();
  const txData = [
    { title: 'Monthly Salary',    amount: 5500,  type: 'income',  daysAgo: 2,  category: 'Salary',        account: checking.id },
    { title: 'Freelance Project', amount: 800,   type: 'income',  daysAgo: 5,  category: 'Investment',    account: checking.id },
    { title: 'Netflix',           amount: 15.99, type: 'expense', daysAgo: 3,  category: 'Entertainment', account: checking.id },
    { title: 'Spotify',           amount: 9.99,  type: 'expense', daysAgo: 3,  category: 'Entertainment', account: checking.id },
    { title: 'Grocery Store',     amount: 87.40, type: 'expense', daysAgo: 4,  category: 'Food',          account: cash.id },
    { title: 'Electricity Bill',  amount: 65,    type: 'expense', daysAgo: 6,  category: 'Bills',         account: checking.id },
    { title: 'Internet Bill',     amount: 49.99, type: 'expense', daysAgo: 6,  category: 'Bills',         account: checking.id },
    { title: 'Restaurant Dinner', amount: 52.50, type: 'expense', daysAgo: 8,  category: 'Food',          account: cash.id },
    { title: 'Amazon Order',      amount: 34.99, type: 'expense', daysAgo: 10, category: 'Shopping',      account: checking.id },
    { title: 'Gym Membership',    amount: 29.99, type: 'expense', daysAgo: 12, category: 'Health',        account: checking.id },
    { title: 'Salary',            amount: 5500,  type: 'income',  daysAgo: 32, category: 'Salary',        account: checking.id },
    { title: 'Coffee Shop',       amount: 12.50, type: 'expense', daysAgo: 14, category: 'Food',          account: cash.id },
    { title: 'Uber Ride',         amount: 18.00, type: 'expense', daysAgo: 16, category: 'Travel',        account: checking.id },
    { title: 'Doctor Visit',      amount: 45.00, type: 'expense', daysAgo: 20, category: 'Health',        account: checking.id },
    { title: 'Zara',              amount: 89.00, type: 'expense', daysAgo: 22, category: 'Shopping',      account: checking.id },
    { title: 'Salary',            amount: 5500,  type: 'income',  daysAgo: 62, category: 'Salary',        account: checking.id },
    { title: 'Flight Tickets',    amount: 320,   type: 'expense', daysAgo: 40, category: 'Travel',        account: checking.id },
    { title: 'Pharmacy',          amount: 23.80, type: 'expense', daysAgo: 45, category: 'Health',        account: cash.id },
    { title: 'Dividend Income',   amount: 220,   type: 'income',  daysAgo: 50, category: 'Investment',    account: savings.id },
    { title: 'Book Store',        amount: 44.00, type: 'expense', daysAgo: 55, category: 'Shopping',      account: cash.id },
  ];

  for (const tx of txData) {
    const date = new Date(now);
    date.setDate(date.getDate() - tx.daysAgo);
    await prisma.transaction.create({
      data: {
        title: tx.title,
        amount: tx.amount,
        type: tx.type,
        date,
        categoryId: catMap[tx.category],
        accountId: tx.account,
        paymentMethod: tx.account === cash.id ? 'cash' : 'card',
        userId: user.id,
      },
    });
  }

  // Budgets — current month
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const budgetData = [
    { category: 'Food',          amount: 400,  spent: 152.40 },
    { category: 'Shopping',      amount: 300,  spent: 123.99 },
    { category: 'Entertainment', amount: 100,  spent: 25.98  },
    { category: 'Health',        amount: 150,  spent: 74.99  },
    { category: 'Travel',        amount: 200,  spent: 18.00  },
    { category: 'Bills',         amount: 250,  spent: 114.99 },
  ];

  for (const b of budgetData) {
    await prisma.budget.create({
      data: { categoryId: catMap[b.category], amount: b.amount, spent: b.spent, month, year, userId: user.id },
    });
  }

  // Goals
  await prisma.goal.createMany({
    data: [
      { name: 'Emergency Fund', targetAmount: 10000, savedAmount: 4200, color: '#10b981', icon: 'shield', userId: user.id },
      { name: 'New Laptop',     targetAmount: 2000,  savedAmount: 850,  color: '#6366f1', icon: 'laptop', userId: user.id, deadline: new Date(now.getFullYear(), now.getMonth() + 4, 1) },
      { name: 'Vacation',       targetAmount: 3500,  savedAmount: 1100, color: '#f59e0b', icon: 'plane',  userId: user.id, deadline: new Date(now.getFullYear() + 1, 5, 1) },
    ],
  });

  // Bills
  await prisma.bill.createMany({
    data: [
      { name: 'Rent',          amount: 1200,  dueDate: 1,  color: '#ef4444', icon: 'home',    userId: user.id, isRecurring: true },
      { name: 'Electricity',   amount: 65,    dueDate: 10, color: '#f59e0b', icon: 'zap',     userId: user.id, isRecurring: true },
      { name: 'Internet',      amount: 49.99, dueDate: 12, color: '#3b82f6', icon: 'wifi',    userId: user.id, isRecurring: true },
      { name: 'Netflix',       amount: 15.99, dueDate: 18, color: '#dc2626', icon: 'tv',      userId: user.id, isRecurring: true },
      { name: 'Gym',           amount: 29.99, dueDate: 20, color: '#8b5cf6', icon: 'dumbbell',userId: user.id, isRecurring: true },
      { name: 'Car Insurance', amount: 89,    dueDate: 25, color: '#0ea5e9', icon: 'car',     userId: user.id, isRecurring: true },
    ],
  });

  // Settings
  await prisma.settings.create({ data: { userId: user.id, theme: 'light', currency: 'USD' } });

  console.log('✅ Seed complete!');
  console.log('   Email:    demo@finflow.app');
  console.log('   Password: Demo@1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
