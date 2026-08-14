# FinFlow — Personal Finance Dashboard

A full-stack personal finance application built with Next.js 15, Express, PostgreSQL, and Prisma.

![FinFlow Dashboard](https://via.placeholder.com/1200x600/6366f1/ffffff?text=FinFlow+Dashboard)

## Features

- **Dashboard** — Balance, income, expenses, savings, charts, recent transactions
- **Accounts** — Bank, cash, wallet, credit card accounts with live balance tracking
- **Transactions** — Add, edit, delete, search, filter, and upload receipts
- **Budgets** — Monthly category budgets with progress tracking and overspend alerts
- **Goals** — Savings goals with progress bars and deadlines
- **Bills** — Recurring bill management with due-date reminders via email
- **Reports** — Download monthly/yearly reports as PDF or CSV
- **Auth** — Register, login, email verification, forgot/reset password, JWT + HTTP-only cookies
- **Profile** — Update name, avatar (Cloudinary), change password
- **Dark / Light mode**

---

## Tech Stack

| Layer      | Technology                                 |
|------------|--------------------------------------------|
| Frontend   | Next.js 15 (App Router), Tailwind CSS v4   |
| UI         | shadcn/ui components, Framer Motion        |
| Charts     | Recharts                                   |
| Forms      | React Hook Form                            |
| Backend    | Node.js, Express.js                        |
| Database   | PostgreSQL + Prisma ORM                    |
| Auth       | JWT, bcrypt, HTTP-only cookies             |
| Storage    | Cloudinary (receipts + avatars)            |
| Email      | Nodemailer (Gmail SMTP)                    |

---

## Project Structure

```
FinFlow/
├── client/                  # Next.js frontend
│   ├── app/
│   │   ├── (auth)/          # Login, register, verify, reset
│   │   └── (dashboard)/     # Protected pages
│   ├── components/
│   │   ├── charts/          # Recharts components
│   │   ├── dashboard/       # Stat cards, recent transactions
│   │   ├── layout/          # Sidebar, header, dashboard layout
│   │   ├── transactions/    # Transaction form
│   │   └── ui/              # shadcn/ui base components
│   ├── hooks/               # useAuth, useTheme
│   ├── lib/                 # Utilities, formatters
│   └── services/            # Axios API layer
│
└── server/                  # Express backend
    ├── controllers/         # Route handlers
    ├── routes/              # Express routers
    ├── middleware/          # Auth, error handler, upload
    ├── prisma/              # Schema, migrations, seed
    ├── config/              # DB (Prisma), Cloudinary
    └── utils/               # Email, templates, bill reminders
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- A Cloudinary account (free tier works)
- A Gmail account with an App Password

---

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/finflow.git
cd finflow
```

---

### 2. Set up the backend

```bash
cd server
npm install
```

Copy `.env` and fill in your values:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/finflow"
JWT_SECRET="change-this-to-a-random-string"
JWT_EXPIRE="7d"
PORT=5000
CLIENT_URL="http://localhost:3000"

# Gmail SMTP — use an App Password, not your real password
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="FinFlow <your-email@gmail.com>"

# Cloudinary (from cloudinary.com dashboard)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

**Create the database and run migrations:**

```bash
# Create the DB first in psql:  CREATE DATABASE finflow;
npx prisma migrate deploy
```

**Seed with demo data (optional but recommended):**

```bash
npx prisma db seed
# Demo credentials:  demo@finflow.app / Demo@1234
```

**Start the server:**

```bash
npm run dev          # development (nodemon)
npm start            # production
```

---

### 3. Set up the frontend

```bash
cd ../client
npm install
```

The `.env.local` is already configured for local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Start the dev server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Quick Start (Demo)

After seeding, log in with:

```
Email:    demo@finflow.app
Password: Demo@1234
```

This account has pre-populated transactions, budgets, goals, and bills so you can explore all features immediately.

---

## Environment Variables Reference

### Server (`server/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `JWT_EXPIRE` | Token expiry (e.g. `7d`) |
| `PORT` | Server port (default: 5000) |
| `CLIENT_URL` | Frontend URL for CORS and email links |
| `SMTP_HOST/PORT/USER/PASS` | Nodemailer config |
| `FROM_EMAIL` | Sender display name and address |
| `CLOUDINARY_*` | Cloudinary credentials |

### Client (`client/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET  | `/api/auth/me` | Get current user |
| POST | `/api/auth/verify-email` | Verify email token |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password` | Reset password |
| PUT  | `/api/auth/update-profile` | Update name/avatar |
| PUT  | `/api/auth/change-password` | Change password |
| GET/POST | `/api/accounts` | List / create accounts |
| PUT/DELETE | `/api/accounts/:id` | Update / delete account |
| GET/POST | `/api/transactions` | List / create transactions |
| PUT/DELETE | `/api/transactions/:id` | Update / delete transaction |
| GET/POST | `/api/categories` | List / create categories |
| GET/POST | `/api/budgets` | List / create budgets |
| GET/POST | `/api/goals` | List / create goals |
| GET/POST | `/api/bills` | List / create bills |
| POST | `/api/bills/:id/toggle-paid` | Mark bill paid/unpaid |
| GET | `/api/dashboard` | Dashboard stats |
| GET | `/api/dashboard/charts` | Chart data |
| GET | `/api/dashboard/reports` | Report data |
| GET/PUT | `/api/settings` | User settings |

---

## Deployment Notes

- Set `NODE_ENV=production` on the server
- Use a process manager like PM2: `pm2 start index.js --name finflow-api`
- For the frontend: `npm run build && npm start` or deploy to Vercel
- Make sure `CLIENT_URL` in the server `.env` matches your frontend domain

---

## Future Scope

- AI Financial Advisor
- OCR Receipt Scanner
- Investment Portfolio Tracking
- Fraud Detection Alerts
- Multi-user / Family accounts
