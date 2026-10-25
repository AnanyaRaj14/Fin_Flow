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

async function seedUserData(userEmail) {
  console.log(`\n========================================`);
  console.log(`Seeding data for: ${userEmail}`);
  console.log(`========================================`);

  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) {
    console.log(`User ${userEmail} not found. Skipping.`);
    return;
  }

  // 1. Ensure categories exist
  let categories = await prisma.category.findMany({ where: { userId: user.id } });
  if (categories.length === 0) {
    categories = await Promise.all(
      defaultCategories.map((c) =>
        prisma.category.create({ data: { ...c, userId: user.id } })
      )
    );
  }
  const catMap = Object.fromEntries(categories.map((c) => [c.name, c.id]));

  // 2. Ensure accounts exist
  let accounts = await prisma.account.findMany({ where: { userId: user.id } });
  if (accounts.length === 0) {
    const acc1 = await prisma.account.create({
      data: { name: 'HDFC Salary Account', type: 'bank', balance: 185450, color: '#6366f1', icon: 'building', userId: user.id },
    });
    const acc2 = await prisma.account.create({
      data: { name: 'ICICI Wealth Savings', type: 'bank', balance: 450000, color: '#10b981', icon: 'piggy-bank', userId: user.id },
    });
    const acc3 = await prisma.account.create({
      data: { name: 'Zerodha Portfolio', type: 'investment', balance: 620000, color: '#8b5cf6', icon: 'trending-up', userId: user.id },
    });
    const acc4 = await prisma.account.create({
      data: { name: 'Cash Wallet', type: 'cash', balance: 8500, color: '#f59e0b', icon: 'banknote', userId: user.id },
    });
    accounts = [acc1, acc2, acc3, acc4];
  }
  const primaryAccount = accounts[0];
  const savingsAccount = accounts[1] || accounts[0];
  const cashAccount = accounts.find((a) => a.type === 'cash') || accounts[0];

  // 3. Populate 2026 Transactions across the year
  const existingTxCount = await prisma.transaction.count({ where: { userId: user.id } });
  console.log(`Current transactions count: ${existingTxCount}`);

  if (existingTxCount < 5) {
    const months = [
      { m: 0, year: 2026, salary: 185000, extra: 35000 },
      { m: 1, year: 2026, salary: 185000, extra: 20000 },
      { m: 2, year: 2026, salary: 185000, extra: 45000 },
      { m: 3, year: 2026, salary: 195000, extra: 15000 },
      { m: 4, year: 2026, salary: 195000, extra: 25000 },
      { m: 5, year: 2026, salary: 195000, extra: 50000 },
      { m: 6, year: 2026, salary: 195000, extra: 18000 },
      { m: 7, year: 2026, salary: 210000, extra: 30000 },
      { m: 8, year: 2026, salary: 210000, extra: 40000 },
      { m: 9, year: 2026, salary: 210000, extra: 45000 }, // Current month (October)
    ];

    const txToInsert = [];

    for (const item of months) {
      // Monthly Salary
      txToInsert.push({
        title: 'Monthly Tech Lead Salary',
        amount: item.salary,
        type: 'income',
        date: new Date(item.year, item.m, 1, 10, 0),
        categoryId: catMap['Salary'] || categories[0].id,
        accountId: primaryAccount.id,
        paymentMethod: 'bank_transfer',
        userId: user.id,
      });

      // Secondary Income / Consulting
      if (item.extra > 0) {
        txToInsert.push({
          title: 'Consulting & Dividend Payout',
          amount: item.extra,
          type: 'income',
          date: new Date(item.year, item.m, 5, 14, 30),
          categoryId: catMap['Investment'] || categories[0].id,
          accountId: savingsAccount.id,
          paymentMethod: 'bank_transfer',
          userId: user.id,
        });
      }

      // Expenses for each month
      txToInsert.push(
        {
          title: 'Apartment Maintenance & Utilities',
          amount: 14500,
          type: 'expense',
          date: new Date(item.year, item.m, 6, 11, 0),
          categoryId: catMap['Bills'] || categories[0].id,
          accountId: primaryAccount.id,
          paymentMethod: 'card',
          userId: user.id,
        },
        {
          title: 'Gourmet Grocery & Organics',
          amount: 12400,
          type: 'expense',
          date: new Date(item.year, item.m, 11, 18, 0),
          categoryId: catMap['Food'] || categories[0].id,
          accountId: cashAccount.id,
          paymentMethod: 'card',
          userId: user.id,
        },
        {
          title: 'Fuel & High-speed Transit',
          amount: 5800,
          type: 'expense',
          date: new Date(item.year, item.m, 15, 9, 30),
          categoryId: catMap['Travel'] || categories[0].id,
          accountId: primaryAccount.id,
          paymentMethod: 'card',
          userId: user.id,
        },
        {
          title: 'Weekend Dining & Bistros',
          amount: 8200,
          type: 'expense',
          date: new Date(item.year, item.m, 20, 20, 0),
          categoryId: catMap['Food'] || categories[0].id,
          accountId: primaryAccount.id,
          paymentMethod: 'card',
          userId: user.id,
        },
        {
          title: 'Subscriptions (Netflix, AWS, Fiber)',
          amount: 4890,
          type: 'expense',
          date: new Date(item.year, item.m, 22, 12, 0),
          categoryId: catMap['Bills'] || categories[0].id,
          accountId: primaryAccount.id,
          paymentMethod: 'card',
          userId: user.id,
        },
        {
          title: 'Apparel & Lifestyle Shopping',
          amount: 9500,
          type: 'expense',
          date: new Date(item.year, item.m, 24, 16, 45),
          categoryId: catMap['Shopping'] || categories[0].id,
          accountId: primaryAccount.id,
          paymentMethod: 'card',
          userId: user.id,
        }
      );
    }

    // Insert all transactions
    for (const t of txToInsert) {
      await prisma.transaction.create({ data: t });
    }
    console.log(`Inserted ${txToInsert.length} transactions for year 2026.`);
  }

  // 4. Update / Insert Budgets for October 2026
  const currentMonth = 10;
  const currentYear = 2026;

  const standardBudgets = [
    { category: 'Food', amount: 25000, spent: 18450 },
    { category: 'Shopping', amount: 20000, spent: 12800 },
    { category: 'Travel', amount: 10000, spent: 6200 },
    { category: 'Bills', amount: 20000, spent: 14500 },
    { category: 'Entertainment', amount: 8000, spent: 4890 },
    { category: 'Health', amount: 12000, spent: 3200 },
  ];

  for (const b of standardBudgets) {
    const catId = catMap[b.category];
    if (catId) {
      const existing = await prisma.budget.findFirst({
        where: { userId: user.id, categoryId: catId, month: currentMonth, year: currentYear },
      });
      if (existing) {
        await prisma.budget.update({
          where: { id: existing.id },
          data: { amount: b.amount, spent: b.spent },
        });
      } else {
        await prisma.budget.create({
          data: {
            userId: user.id,
            categoryId: catId,
            month: currentMonth,
            year: currentYear,
            amount: b.amount,
            spent: b.spent,
          },
        });
      }
    }
  }
  console.log('Budgets synchronized.');

  // 5. Bills (Upcoming Commitments)
  const existingBills = await prisma.bill.count({ where: { userId: user.id } });
  if (existingBills === 0) {
    await prisma.bill.createMany({
      data: [
        { name: 'AWS Cloud Hosting', amount: 4850, dueDate: 28, color: '#f59e0b', icon: 'server', userId: user.id, isRecurring: true },
        { name: 'High-speed Fiber 1Gbps', amount: 1499, dueDate: 30, color: '#3b82f6', icon: 'wifi', userId: user.id, isRecurring: true },
        { name: 'Apartment Maintenance', amount: 5500, dueDate: 31, color: '#ef4444', icon: 'home', userId: user.id, isRecurring: true },
        { name: 'Cult.fit Gym & Wellness', amount: 2499, dueDate: 4, color: '#8b5cf6', icon: 'dumbbell', userId: user.id, isRecurring: true },
        { name: 'Netflix 4K & Spotify Family', amount: 1198, dueDate: 6, color: '#dc2626', icon: 'tv', userId: user.id, isRecurring: true },
      ],
    });
    console.log('Bills created.');
  }

  // 6. Goals
  const existingGoals = await prisma.goal.count({ where: { userId: user.id } });
  if (existingGoals <= 2) {
    await prisma.goal.createMany({
      data: [
        { name: 'Japan Winter Trip 2027', targetAmount: 250000, savedAmount: 165000, color: '#f59e0b', icon: 'plane', userId: user.id, deadline: new Date(2027, 1, 15) },
        { name: 'Emergency Liquid Reserve', targetAmount: 500000, savedAmount: 380000, color: '#10b981', icon: 'shield', userId: user.id },
      ],
    });
    console.log('Additional goals created.');
  }

  console.log(`✅ Seeding complete for ${userEmail}`);
}

async function main() {
  // 1. Seed logged-in user
  await seedUserData('theananyaraj1421@gmail.com');

  // 2. Also ensure demo user exists
  const demoEmail = 'demo@finflow.app';
  let demo = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!demo) {
    const password = await bcrypt.hash('Demo@1234', 12);
    demo = await prisma.user.create({
      data: {
        name: 'Demo User',
        email: demoEmail,
        password,
        isVerified: true,
      },
    });
  }
  await seedUserData(demoEmail);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
