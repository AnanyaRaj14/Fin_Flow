# FinFlow — Personal Finance Dashboard

<div align="center">

![FinFlow](https://img.shields.io/badge/FinFlow-Personal%20Finance-6366f1?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Express](https://img.shields.io/badge/Express-4-green?style=for-the-badge&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue?style=for-the-badge&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)

**A full-stack personal finance application to track income, expenses, budgets, savings goals and bills — all in one place.**

</div>

---

## Table of Contents

1. [What is FinFlow?](#what-is-finflow)
2. [Why was it built?](#why-was-it-built)
3. [Features](#features)
4. [Tech Stack](#tech-stack)
5. [Project Structure](#project-structure)
6. [Getting Started](#getting-started)
7. [Environment Variables](#environment-variables)
8. [Database Setup](#database-setup)
9. [Running the App](#running-the-app)
10. [API Reference](#api-reference)
11. [Authentication Flow](#authentication-flow)
12. [Architecture Decisions](#architecture-decisions)
13. [Low-Level Q&A](#low-level-qa)
14. [Mid-Level Q&A](#mid-level-qa)
15. [High-Level Q&A](#high-level-qa)
16. [Known Limitations](#known-limitations)
17. [Future Scope](#future-scope)

---

## What is FinFlow?

FinFlow is a **single-user personal finance dashboard** built as a full-stack web application. It gives you a clear, real-time picture of your financial health — where your money comes from, where it goes, how much you save, and whether you are on track with your goals.

It is designed to feel like a real product — not a tutorial CRUD app. The UI is inspired by fintech products like Stripe Dashboard, Revolut, and Mercury, with a clean minimal design, smooth animations and full dark/light mode support.

---

## Why was it built?

Most people track finances in spreadsheets or don't track at all. Existing apps are either too complex, too expensive, or don't give developers insight into how they work. FinFlow was built to:

- Demonstrate a complete full-stack project with production-quality code
- Show real authentication patterns (JWT + HTTP-only cookies, email verification, password reset)
- Practice integrating third-party services (Cloudinary, Nodemailer, PostgreSQL)
- Build something genuinely useful that showcases frontend, backend, database, and API skills together

---

## Features

### Authentication
| Feature | Description |
|---------|-------------|
| Register | Create an account with name, email, password |
| Email Verification | Verification link sent on register; must verify before login |
| Resend Verification | Button on login page if token expired |
| Login | JWT stored in HTTP-only cookie |
| Logout | Clears cookie server-side |
| Forgot Password | Sends reset link via email |
| Reset Password | Token-based, expires in 1 hour |
| Update Profile | Change name, upload avatar (Cloudinary) |
| Change Password | Requires current password confirmation |

### Dashboard
- Total Balance (sum of all accounts)
- Monthly Income, Expenses, Savings
- Remaining Budget
- Active Goals count
- 4 charts: Income vs Expenses, Expenses by Category, Savings Trend, Monthly Spending
- Recent 5 transactions
- Upcoming bills (due within 7 days)
- Budget exceeded warnings

### Accounts
- Create multiple accounts: Bank, Cash, Wallet, Credit Card
- Custom name, color per account
- Balance auto-updates on every transaction add/edit/delete
- Total balance shown across all accounts

### Transactions
- Add income or expense transactions
- Fields: Title, Amount, Date, Type, Category, Account, Payment Method, Notes, Receipt image
- Search by title
- Filter by type, category, account, date range
- Pagination (20 per page)
- Receipt upload to Cloudinary
- Balance reversal on edit or delete

### Categories
- 9 default categories: Salary, Food, Shopping, Travel, Bills, Health, Entertainment, Investment, Others
- Create custom categories with name, type (income/expense/both) and color
- Default categories cannot be edited or deleted

### Budgets
- Set monthly budgets per category
- View spending progress with color-coded bars
- Red warning when budget is exceeded
- Overall monthly budget summary bar

### Savings Goals
- Create goals with target amount, saved amount, deadline, color
- Progress bar per goal
- Auto-marks as completed when saved >= target
- Active goals count shown on dashboard

### Bills
- Add recurring bills with name, amount, due day of month, color
- Mark as paid / unpaid with one click
- Due-soon badge for bills within 3 days
- Automated email reminders sent 1, 3, and 7 days before due date

### Reports
- Generate monthly or yearly reports
- Summary: total income, expenses, savings
- Full transaction table preview
- Download as **PDF** (via jsPDF + AutoTable)
- Download as **CSV** (client-side generation)

### Settings
- Update profile name and avatar
- Change password
- Toggle dark / light theme
- Switch currency (INR, USD, EUR, GBP, JPY, AUD, CAD, SGD)

### Notifications
- Bell icon in header shows live alerts:
  - Bills due within 7 days
  - Budgets exceeded this month
  - Completed goals
  - Low total balance (< ₹100)

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 15 | React framework with App Router |
| React | 19 | UI library |
| Tailwind CSS | v4 | Utility-first styling |
| Framer Motion | latest | Animations and transitions |
| Recharts | latest | Charts and data visualisation |
| React Hook Form | latest | Form state management and validation |
| Axios | latest | HTTP client with interceptors |
| Lucide React | latest | Icon library |
| jsPDF + AutoTable | latest | PDF report generation |
| Papaparse | latest | CSV generation |
| Radix UI | latest | Accessible headless UI primitives |
| clsx + tailwind-merge | latest | Conditional class names |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 22 | JavaScript runtime |
| Express.js | 4 | HTTP server and routing |
| Prisma ORM | 6 | Database access layer |
| PostgreSQL | 17 | Relational database |
| bcryptjs | latest | Password hashing |
| jsonwebtoken | latest | JWT creation and verification |
| cookie-parser | latest | Parse HTTP-only cookies |
| cors | latest | Cross-origin resource sharing |
| nodemailer | latest | Email sending |
| cloudinary | latest | Image storage for receipts and avatars |
| multer + multer-storage-cloudinary | latest | File upload middleware |
| express-async-errors | latest | Async error propagation to error handler |
| dotenv | latest | Environment variable loading |
| nodemon | latest | Dev auto-restart |

---

## Project Structure

```
FinFlow/
│
├── client/                          # Next.js 15 frontend
│   ├── app/
│   │   ├── (auth)/                  # Auth pages (no sidebar)
│   │   │   ├── login/page.js
│   │   │   ├── register/page.js
│   │   │   ├── forgot-password/page.js
│   │   │   ├── reset-password/page.js
│   │   │   ├── verify-email/page.js
│   │   │   └── layout.js            # Centered auth layout
│   │   ├── (dashboard)/             # Protected pages (with sidebar)
│   │   │   ├── dashboard/page.js
│   │   │   ├── accounts/page.js
│   │   │   ├── transactions/page.js
│   │   │   ├── budgets/page.js
│   │   │   ├── goals/page.js
│   │   │   ├── bills/page.js
│   │   │   ├── categories/page.js
│   │   │   ├── reports/page.js
│   │   │   ├── settings/page.js
│   │   │   ├── layout.js            # Auth guard
│   │   │   └── loading.js           # Suspense fallback
│   │   ├── globals.css              # Tailwind v4 + CSS variables
│   │   ├── layout.js                # Root layout with providers
│   │   ├── page.js                  # Redirects to /dashboard
│   │   └── not-found.js             # 404 page
│   │
│   ├── components/
│   │   ├── charts/                  # Recharts wrappers
│   │   │   ├── IncomeExpenseChart.jsx
│   │   │   ├── ExpensesByCategoryChart.jsx
│   │   │   ├── SavingsTrendChart.jsx
│   │   │   └── MonthlySpendingChart.jsx
│   │   ├── dashboard/               # Dashboard-specific widgets
│   │   │   ├── StatCard.jsx
│   │   │   ├── RecentTransactions.jsx
│   │   │   ├── UpcomingBills.jsx
│   │   │   └── BudgetWarnings.jsx
│   │   ├── layout/                  # App shell
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── DashboardLayout.jsx
│   │   │   └── NotificationsPanel.jsx
│   │   ├── transactions/
│   │   │   └── TransactionForm.jsx
│   │   └── ui/                      # Reusable shadcn-style components
│   │       ├── button.jsx
│   │       ├── card.jsx
│   │       ├── dialog.jsx
│   │       ├── confirm-dialog.jsx   # Replaces browser confirm()
│   │       ├── select.jsx
│   │       ├── input.jsx
│   │       ├── label.jsx
│   │       ├── progress.jsx
│   │       ├── badge.jsx
│   │       ├── avatar.jsx
│   │       ├── skeleton.jsx
│   │       ├── toast.jsx
│   │       ├── switch.jsx
│   │       ├── tabs.jsx
│   │       ├── textarea.jsx
│   │       ├── separator.jsx
│   │       └── dropdown-menu.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js               # Auth context + session management
│   │   ├── useTheme.js              # Dark/light theme context
│   │   └── useToast.js              # Toast notification helper
│   │
│   ├── lib/
│   │   └── utils.js                 # cn(), formatCurrency(), formatDate()
│   │
│   ├── services/
│   │   └── api.js                   # Axios instance + all API functions
│   │
│   └── public/                      # Static assets
│
└── server/                          # Express backend
    ├── controllers/
    │   ├── authController.js        # Register, login, verify, reset
    │   ├── accountController.js
    │   ├── transactionController.js # Balance update logic
    │   ├── categoryController.js
    │   ├── budgetController.js      # Upsert + spent tracking
    │   ├── goalController.js        # Auto-complete on save
    │   ├── billController.js        # Toggle paid + paidAt timestamp
    │   ├── dashboardController.js   # Stats, charts, reports
    │   └── settingsController.js
    │
    ├── routes/                      # Express routers (one per resource)
    ├── middleware/
    │   ├── auth.js                  # JWT verify middleware
    │   ├── errorHandler.js          # Global error handler
    │   └── upload.js                # Multer + Cloudinary storage
    │
    ├── prisma/
    │   ├── schema.prisma            # Data models
    │   ├── seed.js                  # Demo data seeder
    │   └── migrations/              # SQL migration files
    │
    ├── config/
    │   ├── db.js                    # Prisma client singleton
    │   └── cloudinary.js            # Cloudinary config
    │
    ├── utils/
    │   ├── sendEmail.js             # Nodemailer transporter
    │   ├── emailTemplates.js        # HTML email templates
    │   ├── generateToken.js         # crypto.randomBytes token
    │   ├── defaultCategories.js     # Seed categories list
    │   └── billReminder.js          # Daily reminder scheduler
    │
    ├── index.js                     # App entry point
    ├── nodemon.json                 # Dev watcher config
    └── .env                         # Environment variables (gitignored)
```

---

## Getting Started

### Prerequisites

- **Node.js** 18 or higher (22 recommended)
- **PostgreSQL** 14 or higher
- **Git**
- A **Cloudinary** account (free tier — for receipt/avatar uploads)
- A **Gmail** account with an App Password (for email sending)

### Clone the repository

```bash
git clone https://github.com/AnanyaRaj14/Fin_Flow.git
cd Fin_Flow
```

---

## Environment Variables

### Server (`server/.env`)

Create the file and fill in your values:

```env
# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/finflow"

# JWT
JWT_SECRET="your-long-random-secret-string"
JWT_EXPIRE="7d"

# Server
PORT=5000
CLIENT_URL="http://localhost:3001"

# Email (Gmail SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-gmail@gmail.com"
SMTP_PASS="your-16-char-app-password"
FROM_EMAIL="FinFlow <your-gmail@gmail.com>"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

> **Getting a Gmail App Password:**
> Go to Google Account → Security → 2-Step Verification → App Passwords → Generate one for "Mail"

> **Getting Cloudinary credentials:**
> Sign up at cloudinary.com → Dashboard → Copy Cloud Name, API Key, API Secret

### Client (`client/.env.local`)

Already configured. No changes needed for local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Database Setup

### 1. Create the database

Open psql or pgAdmin and run:

```sql
CREATE DATABASE finflow;
```

### 2. Run migrations (creates all tables)

```bash
cd server
npx prisma migrate deploy
```

This creates 8 tables: `User`, `Account`, `Category`, `Transaction`, `Budget`, `Goal`, `Bill`, `Settings`

### 3. Seed demo data (optional but recommended)

```bash
npx prisma db seed
```

This creates a demo account with pre-populated transactions, budgets, goals and bills:

```
Email:    demo@finflow.app
Password: Demo@1234
```

### 4. Generate Prisma client (if not already done)

```bash
npx prisma generate
```

---

## Running the App

### Development

Open **two terminals**:

```bash
# Terminal 1 — Backend
cd server
npm run dev
# Server starts on http://localhost:5000

# Terminal 2 — Frontend
cd client
npm run dev
# Frontend starts on http://localhost:3001
```

Open **http://localhost:3001** in your browser.

### Production

```bash
# Backend
cd server
npm start

# Frontend
cd client
npm run build
npm start
```

---

## API Reference

All routes are prefixed with `/api`. Protected routes require a valid JWT cookie.

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Create account, send verification email |
| POST | `/login` | ❌ | Login, set JWT cookie |
| POST | `/logout` | ❌ | Clear JWT cookie |
| GET | `/me` | ✅ | Get current user |
| POST | `/verify-email` | ❌ | Verify email with token |
| POST | `/resend-verification` | ❌ | Resend verification email |
| POST | `/forgot-password` | ❌ | Send password reset email |
| POST | `/reset-password` | ❌ | Reset password with token |
| PUT | `/update-profile` | ✅ | Update name and/or avatar |
| PUT | `/change-password` | ✅ | Change password |

### Accounts — `/api/accounts`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all accounts |
| POST | `/` | Create account |
| PUT | `/:id` | Update account |
| DELETE | `/:id` | Delete account (cascades transactions) |

### Transactions — `/api/transactions`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List transactions (paginated, filterable) |
| GET | `/:id` | Get single transaction |
| POST | `/` | Create transaction (updates account balance) |
| PUT | `/:id` | Update transaction (reverses old, applies new) |
| DELETE | `/:id` | Delete transaction (reverses balance) |

**Query params for GET /:** `search`, `categoryId`, `accountId`, `type`, `startDate`, `endDate`, `sortBy`, `sortOrder`, `page`, `limit`

### Categories — `/api/categories`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all categories (default + custom) |
| POST | `/` | Create custom category |
| PUT | `/:id` | Update custom category only |
| DELETE | `/:id` | Delete custom category only |

### Budgets — `/api/budgets`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List budgets for month/year (`?month=&year=`) |
| POST | `/` | Create or update budget (upsert) |
| PUT | `/:id` | Update budget amount |
| DELETE | `/:id` | Delete budget |

### Goals — `/api/goals`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all goals |
| POST | `/` | Create goal |
| PUT | `/:id` | Update goal (auto-completes if saved >= target) |
| DELETE | `/:id` | Delete goal |

### Bills — `/api/bills`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all bills |
| POST | `/` | Create bill |
| PUT | `/:id` | Update bill |
| DELETE | `/:id` | Delete bill |
| POST | `/:id/toggle-paid` | Toggle paid status |

### Dashboard — `/api/dashboard`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Stats: balance, income, expenses, savings, budgets, goals, upcoming bills |
| GET | `/charts` | Chart data: monthly, category breakdown, savings trend, daily spending |
| GET | `/reports` | Report data for PDF/CSV (`?type=monthly&month=&year=`) |

### Settings — `/api/settings`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get user settings |
| PUT | `/` | Update theme and currency |

---

## Authentication Flow

```
Register
  → Hash password (bcrypt, 12 rounds)
  → Save user (isVerified: false)
  → Create default categories + settings
  → Generate crypto token (32 bytes hex)
  → Send verification email (expires 24h)

Verify Email
  → Find user by token + check expiry
  → Set isVerified: true, clear token

Login
  → Find user by email
  → Compare password (bcrypt)
  → Check isVerified
  → Sign JWT (7 day expiry)
  → Set HTTP-only cookie (sameSite: lax)
  → Return user object (no sensitive fields)

Every Protected Request
  → Cookie parsed by cookie-parser
  → JWT verified (middleware/auth.js)
  → User fetched from DB and attached to req.user
  → Handler runs

Logout
  → res.clearCookie('token')

Forgot Password
  → Find user by email (always return same message to prevent enumeration)
  → Generate reset token (32 bytes hex, 1h expiry)
  → Send reset email

Reset Password
  → Find user by token + check expiry
  → Hash new password
  → Clear token fields
```

---

## Architecture Decisions

### Why HTTP-only cookies instead of localStorage for JWT?

localStorage is accessible to JavaScript, which means XSS attacks can steal the token. HTTP-only cookies cannot be read by JavaScript — only sent automatically with requests. Combined with `sameSite: lax` this also provides CSRF protection.

### Why Prisma instead of raw SQL or another ORM?

Prisma gives type-safe database access, readable schema definition, automatic migrations, and a visual studio (Prisma Studio) for debugging. The schema is the single source of truth for the database structure. It also handles connection pooling and prevents SQL injection by design.

### Why Next.js App Router?

The App Router allows route groups (`(auth)`, `(dashboard)`) to share layouts without affecting the URL. The protected layout handles auth checks once for all dashboard routes, and the auth layout provides the centered card design for all auth pages.

### Why separate client and server folders?

This mimics a real production setup where frontend and backend are independently deployable. The client can be deployed to Vercel and the server to Railway, Render, or a VPS — completely separate.

### Why Cloudinary for file uploads?

Storing files on the server filesystem doesn't work well in serverless/container environments and doesn't scale. Cloudinary is a CDN with image transformation capabilities. Multer streams the file directly to Cloudinary without saving it to disk first.

### Why `express-async-errors`?

Express 4 doesn't catch promise rejections in async route handlers. Without this package you'd need `try/catch` in every controller or wrap every handler in a utility function. `express-async-errors` patches Express so thrown errors in async functions automatically reach the global error handler.

### How does balance tracking work?

When a transaction is created: `account.balance += amount` (income) or `account.balance -= amount` (expense).

When a transaction is edited: the old effect is reversed first, then the new effect is applied. This means if you change a ₹500 expense to ₹800, the account gets `+500` (reverse old) then `-800` (apply new) = net `-300`.

When a transaction is deleted: the effect is reversed.

### How does budget tracking work?

Budget `spent` is updated atomically using `updateMany` with `increment/decrement`. When a new expense transaction is created, the matching budget for that category + month + year gets its `spent` field incremented. The same reverse logic applies on edit/delete as with account balances.

---

## Low-Level Q&A

**Q: What hashing algorithm is used for passwords?**
A: bcrypt with a cost factor of 12 (via `bcryptjs`). This means 2^12 = 4096 iterations, making brute-force attacks computationally expensive.

**Q: How long are JWT tokens valid?**
A: 7 days (`JWT_EXPIRE=7d`). The cookie also has `maxAge: 7 * 24 * 60 * 60 * 1000` milliseconds to match.

**Q: How are email verification tokens generated?**
A: `crypto.randomBytes(32).toString('hex')` — 32 bytes of cryptographically secure random data encoded as a 64-character hex string.

**Q: What happens if two users try to register with the same email?**
A: The `User` table has a unique constraint on `email`. Prisma throws error code `P2002` which the global error handler catches and returns `{ message: "email already exists" }` with a 400 status.

**Q: What is the CORS configuration?**
A: The server accepts requests from `localhost:3000`, `localhost:3001`, and `localhost:3002` (to handle Next.js port auto-increment). In production, only `CLIENT_URL` from `.env` should be in the allowed list.

**Q: How does the Prisma singleton work?**
A: `config/db.js` exports a single `PrismaClient` instance. In development, without this pattern, hot-reload would create a new database connection on every file change, quickly exhausting the connection pool.

**Q: How does the receipt upload work technically?**
A: Multer intercepts the multipart/form-data request. `multer-storage-cloudinary` provides a custom storage engine that pipes the file stream directly to Cloudinary's upload API. The returned `secure_url` is stored in the `Transaction.receiptUrl` field. No file ever touches the server's disk.

**Q: What does `minimumFractionDigits: 2` do in formatCurrency?**
A: Forces the number to always show two decimal places. `₹100` becomes `₹100.00`. Without it, whole numbers would display without paise.

**Q: How does pagination work in the transactions API?**
A: `skip: (page - 1) * limit` and `take: limit` in the Prisma query. The response includes `total`, `page`, `pages` so the frontend can render page controls.

**Q: Why is `useCallback` used in `fetchUser` inside `useAuth`?**
A: Without `useCallback`, a new function reference is created on every render. Since `fetchUser` is a dependency of the `useEffect`, without memoisation it would trigger an infinite refetch loop.

---

## Mid-Level Q&A

**Q: How does the protected layout prevent unauthenticated access?**
A: `app/(dashboard)/layout.js` reads `{ user, loading, serverError }` from `useAuth`. It shows a spinner while loading, a "server offline" message if the server is unreachable, and redirects to `/login` only when `loading = false`, `serverError = false`, and `user = null`. This prevents false redirects caused by slow network responses.

**Q: Why does the login page have its own redirect logic?**
A: If a logged-in user navigates to `/login`, `useAuth` already has `user` set. The `useEffect` in the login page detects this and calls `router.replace('/dashboard')`. Without this, a logged-in user would see the login form unnecessarily.

**Q: How does the infinite redirect loop get prevented?**
A: The Axios response interceptor only redirects to `/login` on 401 errors if the current URL is NOT already an auth page. Previously it fired on every 401 including the initial `GET /api/auth/me` check from the login page, causing: login page loads → getMe() → 401 → redirect to /login → login page loads again → loop.

**Q: How do budgets auto-update when transactions change?**
A: In `transactionController.js`, after saving a transaction to the database, a secondary `prisma.budget.updateMany()` call increments/decrements the `spent` field for the matching `userId + categoryId + month + year` combination. On edit, the old effect is reversed before the new one is applied. On delete, the old effect is reversed.

**Q: How does the bill reminder system work?**
A: `utils/billReminder.js` is called once 5 seconds after server startup (to ensure DB is ready), then every 24 hours via `setInterval`. It queries all verified users with unpaid recurring bills and checks if any bill's due day is 1, 3, or 7 days away. If so, it sends an email via Nodemailer.

**Q: How does theme persistence work without server-side rendering issues?**
A: A tiny inline `<script>` tag in `app/layout.js` runs synchronously before React hydrates. It reads `localStorage.getItem('theme')` and adds the `dark` class to `<html>` if needed. This prevents the "flash of wrong theme" (FWOT) on page load.

**Q: What is the `serverError` flag in `useAuth`?**
A: A boolean that distinguishes between "definitely not logged in" (server returned 401) and "we don't know" (server is unreachable — `err.response` is undefined on network errors). The protected layout uses this to show a friendly "start your server" UI instead of redirecting to login and creating a loop.

**Q: How does the `ConfirmDialog` component work?**
A: It's a controlled component that accepts `open`, `onClose`, `onConfirm`, `title`, `description`, and `confirmLabel` props. Each page stores the item to delete in `confirmDelete` state. Clicking the delete icon sets `confirmDelete` to the item object. The dialog reads `confirmDelete?.name` for the description. The `onConfirm` handler calls the delete API, then clears `confirmDelete`. This replaces all native `window.confirm()` browser dialogs.

**Q: Why use `router.replace` instead of `router.push` for redirects?**
A: `replace` doesn't add an entry to the browser history stack. If a user is redirected from `/dashboard` to `/login`, pressing Back shouldn't take them back to the dashboard (which would show the loading spinner and redirect again). `replace` overwrites the current history entry.

**Q: How does the CSV export work without a library?**
A: The report data returned from the API is mapped into a 2D array. Each row is joined with commas and rows are joined with newlines. A `Blob` is created with `type: 'text/csv'`, a temporary `<a>` element is created with `href: URL.createObjectURL(blob)`, programmatically clicked, then the object URL is revoked.

---

## High-Level Q&A

**Q: What is the overall architecture of the application?**
A: FinFlow uses a classic **client-server architecture** with clear separation of concerns. The Next.js frontend is a SPA-like experience (though pages are server-rendered for SEO and initial load performance). The Express backend exposes a RESTful JSON API. PostgreSQL stores all persistent data. The two communicate exclusively over HTTP with JSON, authenticated via JWTs stored in HTTP-only cookies.

**Q: How does the data flow from a user action to the screen?**

```
User clicks "Add Transaction"
  → React Hook Form validates input
  → TransactionForm creates FormData (supports file upload)
  → Axios POSTs to /api/transactions
  → Auth middleware verifies JWT from cookie
  → transactionController creates Transaction record
  → Account.balance updated atomically
  → Budget.spent updated if expense
  → Returns created transaction with category and account populated
  → Frontend updates local state (no full page reload)
  → Toast notification shown
  → Dashboard stats become stale → user refreshes to see updates
```

**Q: How would you scale this application for multiple users?**
A: The current architecture already supports multiple users — every database query filters by `userId`. Scaling horizontally would require:
- Moving the JWT secret to a secrets manager (AWS Secrets Manager, Vault)
- Using a connection pooler like PgBouncer for PostgreSQL
- Running multiple Node.js instances behind a load balancer (sessions work because auth state is in the DB, not in-memory)
- Moving the bill reminder `setInterval` to a dedicated job queue (Bull, BullMQ) to avoid running on every instance
- Adding Redis for rate limiting and session caching

**Q: What are the security considerations in this app?**

| Threat | Mitigation |
|--------|-----------|
| XSS stealing tokens | JWT in HTTP-only cookie (not localStorage) |
| CSRF attacks | `sameSite: lax` cookie flag |
| SQL injection | Prisma uses parameterised queries exclusively |
| Password exposure | bcrypt hashing, never stored or logged in plain text |
| Email enumeration | Forgot password always returns same message |
| Brute force login | (Future: rate limiting with express-rate-limit) |
| Insecure file uploads | Cloudinary validates file type; allowed_formats set in storage config |
| Expired tokens | Verify/reset tokens have expiry timestamps checked server-side |

**Q: What is the difference between the `(auth)` and `(dashboard)` route groups?**
A: These are Next.js **route groups** — parentheses mean the folder name doesn't appear in the URL. They exist purely to share layouts. `(auth)` applies a centered full-screen background layout. `(dashboard)` applies the sidebar + header shell and the `ProtectedLayout` auth guard. Both groups can have routes at the same URL depth without conflicting.

**Q: How does the application handle optimistic vs pessimistic UI updates?**
A: FinFlow uses **pessimistic updates** — the API call completes first, then the local state is updated. This is safer because it ensures the displayed data always reflects what's in the database. The tradeoff is a slight delay before UI feedback, which is mitigated by loading spinners and instant toast notifications on completion.

**Q: What would be needed to make this production-ready?**
1. **Rate limiting** on auth routes (express-rate-limit)
2. **HTTPS** in production (Let's Encrypt via nginx or Caddy)
3. **Helmet.js** for security headers (Content-Security-Policy, HSTS, etc.)
4. **Process manager** like PM2 for the Node.js server
5. **Database backups** with pg_dump on a schedule
6. **Error monitoring** like Sentry for both frontend and backend
7. **Environment-specific config** — production CORS should only allow the exact production domain
8. **Database connection pooling** with PgBouncer or Prisma Accelerate
9. **CI/CD pipeline** — GitHub Actions to run build on every push
10. **Log aggregation** — Winston + Datadog or Logtail

**Q: Why is the `nodemon.json` configured to only watch specific directories?**
A: By default nodemon watches all files in the project. This includes `node_modules` and `prisma/migrations` which change frequently and don't require a restart. Limiting the watch scope to `controllers`, `routes`, `middleware`, `utils`, and `config` means the server only restarts when actual application code changes, making development faster.

**Q: What is the purpose of the `_prisma_migrations` table?**
A: Prisma stores the history of all applied migrations in this table. Each row contains the migration name, applied timestamp, and a checksum. When you run `prisma migrate deploy`, Prisma compares this table against the `migrations/` folder to determine which migrations are new and need to be applied. This prevents applying the same migration twice.

---

## Known Limitations

- **Single user only** — no multi-user or family account support
- **No real-time updates** — dashboard doesn't auto-refresh when a transaction is added in another tab; a manual page refresh is required
- **Bill reminders run on server startup** — if the server is restarted at midnight, reminders may send at unexpected times. A proper cron scheduler (node-cron) or job queue would be more reliable
- **No receipt OCR** — uploaded receipt images are stored but not parsed
- **Currency is display-only** — changing currency in settings changes the symbol shown but does not convert values. All amounts are stored in the original currency

---

## Future Scope

| Feature | Description |
|---------|-------------|
| AI Financial Advisor | Analyse spending patterns and give personalised advice using OpenAI API |
| OCR Receipt Scanner | Extract amount, merchant, date from uploaded receipt images |
| Investment Tracking | Connect to market data APIs for portfolio tracking |
| Multi-user / Family | Shared accounts with per-user permission levels |
| Fraud Detection | Flag unusual spending patterns with rule-based alerts |
| Mobile App | React Native app sharing the same backend API |
| Export to Tally / Excel | Accounting software integration |
| UPI Integration | Auto-import transactions from UPI payment history |

---

## License

MIT License — free to use, modify and distribute.

---

## Author

**Ananya Raj**
- GitHub: [@AnanyaRaj14](https://github.com/AnanyaRaj14)
- Email: ananyaraj2552@gmail.com

---

<div align="center">
Built with ❤️ using Next.js, Express, PostgreSQL and Prisma
</div>
