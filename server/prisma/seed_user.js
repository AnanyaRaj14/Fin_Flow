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

  const monthlyProfiles = [
    {
      month: 0,
      incomes: [
        { title: 'Tech Lead Monthly Retainer & Salary', amount: 185000, day: 1, hour: 10, minute: 0, cat: 'Salary', acc: 'primary' },
        { title: 'Annual Performance Stock Bonus', amount: 75000, day: 5, hour: 14, minute: 30, cat: 'Investment', acc: 'savings' }
      ],
      expenses: [
        { title: 'Annual Comprehensive Health Cover', amount: 24500, day: 3, hour: 11, minute: 0, cat: 'Health', acc: 'primary' },
        { title: 'Apartment Maintenance & Property Dues', amount: 14500, day: 6, hour: 10, minute: 30, cat: 'Bills', acc: 'primary' },
        { title: 'New Year Dinner & Fine Dining', amount: 11800, day: 8, hour: 20, minute: 15, cat: 'Food', acc: 'primary' },
        { title: 'Winter Apparel & Merino Sweaters', amount: 16400, day: 14, hour: 17, minute: 0, cat: 'Shopping', acc: 'primary' },
        { title: 'Organic Pantry & Weekly Essentials', amount: 11200, day: 19, hour: 18, minute: 30, cat: 'Food', acc: 'cash' },
        { title: 'Subscriptions (AWS, Netflix, Spotify)', amount: 4890, day: 22, hour: 12, minute: 0, cat: 'Bills', acc: 'primary' },
        { title: 'Fuel & Airport Express Tolls', amount: 4500, day: 26, hour: 9, minute: 15, cat: 'Travel', acc: 'primary' },
        { title: 'Weekend Roastery & Artisan Cafe', amount: 3000, day: 28, hour: 16, minute: 45, cat: 'Food', acc: 'cash' }
      ]
    },
    {
      month: 1,
      incomes: [
        { title: 'Tech Lead Monthly Retainer & Salary', amount: 185000, day: 1, hour: 10, minute: 0, cat: 'Salary', acc: 'primary' },
        { title: 'Tech Blog & Advisory Stipend', amount: 20000, day: 5, hour: 15, minute: 0, cat: 'Investment', acc: 'savings' }
      ],
      expenses: [
        { title: 'Apartment Utilities & Power Grid', amount: 11200, day: 6, hour: 11, minute: 0, cat: 'Bills', acc: 'primary' },
        { title: 'Gourmet Weekly Market & Provisions', amount: 9800, day: 10, hour: 18, minute: 15, cat: 'Food', acc: 'cash' },
        { title: 'Valentine Bistro & Wine Tasting', amount: 7200, day: 14, hour: 20, minute: 0, cat: 'Food', acc: 'primary' },
        { title: 'Fuel & Metro Smart Card Reload', amount: 3900, day: 18, hour: 9, minute: 30, cat: 'Travel', acc: 'primary' },
        { title: 'Subscriptions (AWS, Netflix, Spotify)', amount: 4890, day: 22, hour: 12, minute: 0, cat: 'Bills', acc: 'primary' },
        { title: 'Kindle Books & Engineering Journals', amount: 2300, day: 25, hour: 14, minute: 30, cat: 'Entertainment', acc: 'primary' }
      ]
    },
    {
      month: 2,
      incomes: [
        { title: 'Tech Lead Monthly Retainer & Salary', amount: 185000, day: 1, hour: 10, minute: 0, cat: 'Salary', acc: 'primary' },
        { title: 'Quarterly Mutual Fund Dividend', amount: 45000, day: 5, hour: 14, minute: 0, cat: 'Investment', acc: 'savings' }
      ],
      expenses: [
        { title: 'Apartment Maintenance & Utilities', amount: 14500, day: 5, hour: 10, minute: 0, cat: 'Bills', acc: 'primary' },
        { title: 'CA Year-End Tax Advisory & Audit', amount: 18000, day: 10, hour: 14, minute: 30, cat: 'Bills', acc: 'primary' },
        { title: 'Ergonomic Desk & Monitor Arm Setup', amount: 32000, day: 14, hour: 16, minute: 0, cat: 'Shopping', acc: 'primary' },
        { title: 'Whole Foods Market & Organics', amount: 12600, day: 18, hour: 18, minute: 45, cat: 'Food', acc: 'cash' },
        { title: 'Fiber Broadband & Cloud Dev Server', amount: 5200, day: 22, hour: 12, minute: 0, cat: 'Bills', acc: 'primary' },
        { title: 'Weekend Dining & Craft Brewery', amount: 7800, day: 25, hour: 20, minute: 30, cat: 'Food', acc: 'primary' },
        { title: 'Fuel & Highway Fastag', amount: 5100, day: 28, hour: 9, minute: 15, cat: 'Travel', acc: 'primary' }
      ]
    },
    {
      month: 3,
      incomes: [
        { title: 'Tech Lead Monthly Retainer & Salary', amount: 195000, day: 1, hour: 10, minute: 0, cat: 'Salary', acc: 'primary' },
        { title: 'Design System Consulting Fee', amount: 35000, day: 5, hour: 14, minute: 30, cat: 'Investment', acc: 'savings' }
      ],
      expenses: [
        { title: 'Goa Coastal Villa & Return Airfare', amount: 52000, day: 4, hour: 12, minute: 0, cat: 'Travel', acc: 'primary' },
        { title: 'Beachside Shack Dinners & Fresh Catch', amount: 14500, day: 9, hour: 20, minute: 0, cat: 'Food', acc: 'primary' },
        { title: 'Apartment Maintenance & Security', amount: 14500, day: 12, hour: 10, minute: 0, cat: 'Bills', acc: 'primary' },
        { title: 'Resort Wear & Sunglasses', amount: 12800, day: 16, hour: 16, minute: 30, cat: 'Shopping', acc: 'primary' },
        { title: 'Weekly Groceries & Cold Press Juices', amount: 9800, day: 20, hour: 18, minute: 0, cat: 'Food', acc: 'cash' },
        { title: 'Subscriptions (AWS, Netflix, Spotify)', amount: 4890, day: 22, hour: 12, minute: 0, cat: 'Bills', acc: 'primary' },
        { title: 'Airport Transfers & Rental Vehicles', amount: 6400, day: 27, hour: 11, minute: 15, cat: 'Travel', acc: 'primary' }
      ]
    },
    {
      month: 4,
      incomes: [
        { title: 'Tech Lead Monthly Retainer & Salary', amount: 195000, day: 1, hour: 10, minute: 0, cat: 'Salary', acc: 'primary' },
        { title: 'Secondary SaaS Product Royalty', amount: 25000, day: 5, hour: 15, minute: 0, cat: 'Investment', acc: 'savings' }
      ],
      expenses: [
        { title: '4K Studio Ultrawide & Mechanical Board', amount: 58000, day: 7, hour: 15, minute: 30, cat: 'Shopping', acc: 'primary' },
        { title: 'Apartment Maintenance & Peak AC Power', amount: 18400, day: 10, hour: 11, minute: 0, cat: 'Bills', acc: 'primary' },
        { title: 'Organic Supermarket & Fresh Produce', amount: 12200, day: 15, hour: 18, minute: 30, cat: 'Food', acc: 'cash' },
        { title: 'Summer Cocktails & Rooftop Lounge', amount: 8500, day: 19, hour: 21, minute: 0, cat: 'Food', acc: 'primary' },
        { title: 'Dental Clean & Annual Health Diagnostic', amount: 6200, day: 22, hour: 10, minute: 0, cat: 'Health', acc: 'primary' },
        { title: 'Fuel & High-speed Transit', amount: 5900, day: 26, hour: 9, minute: 30, cat: 'Travel', acc: 'primary' },
        { title: 'Subscriptions (AWS, Netflix, Spotify)', amount: 4890, day: 28, hour: 12, minute: 0, cat: 'Bills', acc: 'primary' }
      ]
    },
    {
      month: 5,
      incomes: [
        { title: 'Tech Lead Monthly Retainer & Salary', amount: 195000, day: 1, hour: 10, minute: 0, cat: 'Salary', acc: 'primary' },
        { title: 'Enterprise Architecture Consulting', amount: 50000, day: 5, hour: 14, minute: 0, cat: 'Investment', acc: 'savings' }
      ],
      expenses: [
        { title: 'Apartment Maintenance & Utilities', amount: 13500, day: 5, hour: 10, minute: 0, cat: 'Bills', acc: 'primary' },
        { title: 'Weekly Groceries & Daily Dairy', amount: 10800, day: 12, hour: 18, minute: 30, cat: 'Food', acc: 'cash' },
        { title: 'Fuel & Rapid Metro Commute', amount: 4400, day: 16, hour: 9, minute: 15, cat: 'Travel', acc: 'primary' },
        { title: 'Neighborhood Trattoria Dinner', amount: 5200, day: 20, hour: 20, minute: 0, cat: 'Food', acc: 'primary' },
        { title: 'Subscriptions (AWS, Netflix, Spotify)', amount: 4890, day: 22, hour: 12, minute: 0, cat: 'Bills', acc: 'primary' },
        { title: 'Indie Video Games & IMAX Premieres', amount: 3500, day: 27, hour: 17, minute: 30, cat: 'Entertainment', acc: 'primary' }
      ]
    },
    {
      month: 6,
      incomes: [
        { title: 'Tech Lead Monthly Retainer & Salary', amount: 195000, day: 1, hour: 10, minute: 0, cat: 'Salary', acc: 'primary' },
        { title: 'Equity Dividend Payout', amount: 18000, day: 5, hour: 14, minute: 30, cat: 'Investment', acc: 'savings' }
      ],
      expenses: [
        { title: 'Coorg Monsoon Plantation Stay', amount: 28000, day: 6, hour: 12, minute: 0, cat: 'Travel', acc: 'primary' },
        { title: 'Apartment Maintenance & High-speed Fiber', amount: 14500, day: 10, hour: 10, minute: 0, cat: 'Bills', acc: 'primary' },
        { title: 'Gourmet Food Market & Specialty Beans', amount: 11900, day: 14, hour: 18, minute: 15, cat: 'Food', acc: 'cash' },
        { title: 'Waterproof Rainwear & Casual Linens', amount: 8600, day: 18, hour: 16, minute: 0, cat: 'Shopping', acc: 'primary' },
        { title: 'Fine Dining Degustation Menu', amount: 9400, day: 22, hour: 20, minute: 0, cat: 'Food', acc: 'primary' },
        { title: 'Interstate Highway Tolls & Fuel', amount: 4800, day: 26, hour: 9, minute: 30, cat: 'Travel', acc: 'primary' },
        { title: 'Subscriptions (AWS, Netflix, Spotify)', amount: 4890, day: 29, hour: 12, minute: 0, cat: 'Bills', acc: 'primary' }
      ]
    },
    {
      month: 7,
      incomes: [
        { title: 'Tech Lead Monthly Retainer & Salary', amount: 210000, day: 1, hour: 10, minute: 0, cat: 'Salary', acc: 'primary' },
        { title: 'Advisory Retainer & Mentorship', amount: 30000, day: 5, hour: 14, minute: 0, cat: 'Investment', acc: 'savings' }
      ],
      expenses: [
        { title: 'Living Room Teak Bookshelf & Lighting', amount: 34000, day: 8, hour: 16, minute: 30, cat: 'Shopping', acc: 'primary' },
        { title: 'Apartment Maintenance & Grid Power', amount: 14200, day: 11, hour: 10, minute: 0, cat: 'Bills', acc: 'primary' },
        { title: 'Monthly Groceries & Artisanal Cheeses', amount: 12800, day: 15, hour: 18, minute: 30, cat: 'Food', acc: 'cash' },
        { title: 'Weekend Socials & Gastropub Bistro', amount: 9600, day: 20, hour: 20, minute: 0, cat: 'Food', acc: 'primary' },
        { title: 'Live Symphony Concert & Drama', amount: 5500, day: 23, hour: 19, minute: 0, cat: 'Entertainment', acc: 'primary' },
        { title: 'AWS Cloud Infrastructure & Fiber', amount: 4890, day: 26, hour: 12, minute: 0, cat: 'Bills', acc: 'primary' },
        { title: 'Fuel & High-speed Transit', amount: 5200, day: 29, hour: 9, minute: 15, cat: 'Travel', acc: 'primary' }
      ]
    },
    {
      month: 8,
      incomes: [
        { title: 'Tech Lead Monthly Retainer & Salary', amount: 210000, day: 1, hour: 10, minute: 0, cat: 'Salary', acc: 'primary' },
        { title: 'Annual Project Milestone Payout', amount: 65000, day: 5, hour: 14, minute: 30, cat: 'Investment', acc: 'savings' }
      ],
      expenses: [
        { title: 'Next-Gen Flagship Smartphone', amount: 74000, day: 8, hour: 15, minute: 0, cat: 'Shopping', acc: 'primary' },
        { title: 'Festive Designer Kurtas & Ethnic Wear', amount: 26500, day: 12, hour: 17, minute: 30, cat: 'Shopping', acc: 'primary' },
        { title: 'Apartment Maintenance & Festive Dues', amount: 15000, day: 15, hour: 10, minute: 0, cat: 'Bills', acc: 'primary' },
        { title: 'Festive Sweets & Confectionery Gift Boxes', amount: 14200, day: 18, hour: 18, minute: 0, cat: 'Food', acc: 'cash' },
        { title: 'Family Festive Feast & Catering', amount: 16800, day: 21, hour: 20, minute: 0, cat: 'Food', acc: 'primary' },
        { title: 'Subscriptions (AWS, Netflix, Spotify)', amount: 4890, day: 23, hour: 12, minute: 0, cat: 'Bills', acc: 'primary' },
        { title: 'Festive Road Trip Fuel & Cabs', amount: 7600, day: 27, hour: 9, minute: 0, cat: 'Travel', acc: 'primary' }
      ]
    },
    {
      month: 9,
      incomes: [
        { title: 'Tech Lead Monthly Retainer & Salary', amount: 210000, day: 1, hour: 10, minute: 0, cat: 'Salary', acc: 'primary' },
        { title: 'Consulting & Dividend Payout', amount: 46000, day: 5, hour: 14, minute: 30, cat: 'Investment', acc: 'savings' }
      ],
      expenses: [
        { title: 'Apartment Maintenance & Utilities', amount: 14500, day: 6, hour: 11, minute: 0, cat: 'Bills', acc: 'primary' },
        { title: 'Gourmet Grocery & Organics', amount: 12400, day: 11, hour: 18, minute: 0, cat: 'Food', acc: 'cash' },
        { title: 'Fuel & High-speed Transit', amount: 5800, day: 15, hour: 9, minute: 30, cat: 'Travel', acc: 'primary' },
        { title: 'Weekend Dining & Bistros', amount: 8200, day: 21, hour: 20, minute: 0, cat: 'Food', acc: 'primary' },
        { title: 'Subscriptions (Netflix, AWS, Fiber)', amount: 4890, day: 22, hour: 12, minute: 0, cat: 'Bills', acc: 'primary' },
        { title: 'Apparel & Lifestyle Shopping', amount: 17800, day: 24, hour: 16, minute: 45, cat: 'Shopping', acc: 'primary' },
        { title: 'Artisan Coffee Roasters & Bakery', amount: 2100, day: 25, hour: 11, minute: 15, cat: 'Food', acc: 'cash' }
      ]
    }
  ];

  const accLookup = {
    primary: primaryAccount.id,
    savings: savingsAccount.id,
    cash: cashAccount.id,
  };

  const force = process.argv.includes('--force') || process.argv.includes('--reseed');

  if (existingTxCount < 5 || force) {
    if (force && existingTxCount > 0) {
      await prisma.transaction.deleteMany({ where: { userId: user.id } });
      console.log('Cleared existing transactions for reseed.');
    }

    const txToInsert = [];
    for (const mData of monthlyProfiles) {
      const year = 2026;
      const m = mData.month;
      for (const inc of mData.incomes) {
        txToInsert.push({
          title: inc.title,
          amount: inc.amount,
          type: 'income',
          date: new Date(year, m, inc.day, inc.hour, inc.minute),
          categoryId: catMap[inc.cat] || catMap['Salary'] || categories[0].id,
          accountId: accLookup[inc.acc] || primaryAccount.id,
          paymentMethod: 'bank_transfer',
          userId: user.id,
        });
      }
      for (const exp of mData.expenses) {
        txToInsert.push({
          title: exp.title,
          amount: exp.amount,
          type: 'expense',
          date: new Date(year, m, exp.day, exp.hour, exp.minute),
          categoryId: catMap[exp.cat] || catMap['Bills'] || categories[0].id,
          accountId: accLookup[exp.acc] || primaryAccount.id,
          paymentMethod: exp.acc === 'cash' ? 'cash' : 'card',
          userId: user.id,
        });
      }
    }

    // Insert all transactions
    for (const t of txToInsert) {
      await prisma.transaction.create({ data: t });
    }
    console.log(`Inserted ${txToInsert.length} varied transactions for year 2026.`);
  }

  // 4. Update / Insert Budgets for October 2026
  const currentMonth = 10;
  const currentYear = 2026;

  const standardBudgets = [
    { category: 'Food', amount: 28000, spent: 22700 },
    { category: 'Shopping', amount: 25000, spent: 17800 },
    { category: 'Travel', amount: 10000, spent: 5800 },
    { category: 'Bills', amount: 22000, spent: 19390 },
    { category: 'Entertainment', amount: 6000, spent: 0 },
    { category: 'Health', amount: 8000, spent: 0 },
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
