# FinFlow — Personal Finance Dashboard

<div align="center">

![FinFlow](https://img.shields.io/badge/FinFlow-Personal%20Finance-6366f1?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Express](https://img.shields.io/badge/Express-4-green?style=for-the-badge&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue?style=for-the-badge&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)
![Terraform](https://img.shields.io/badge/Terraform-IaC-7B42BC?style=for-the-badge&logo=terraform)

![CI/CD](https://github.com/AnanyaRaj14/finflow/actions/workflows/ci-cd.yml/badge.svg)
![Docker Build](https://github.com/AnanyaRaj14/finflow/actions/workflows/docker-build.yml/badge.svg)
![Code Quality](https://github.com/AnanyaRaj14/finflow/actions/workflows/code-quality.yml/badge.svg)

**A production-ready full-stack personal finance application with automated CI/CD, containerization, and infrastructure as code.**

</div>

---

## Table of Contents

1. [What is FinFlow?](#what-is-finflow)
2. [Why was it built?](#why-was-it-built)
3. [Features](#features)
4. [Tech Stack](#tech-stack)
5. [Architecture Overview](#architecture-overview)
6. [Project Structure](#project-structure)
7. [Getting Started](#getting-started)
8. [Environment Variables](#environment-variables)
9. [Database Setup](#database-setup)
10. [AWS S3 File Storage](#aws-s3-file-storage)
11. [Running the App](#running-the-app)
12. [Docker Deployment](#docker-deployment)
13. [Terraform Infrastructure](#terraform-infrastructure)
14. [CI/CD Pipeline](#cicd-pipeline)
15. [API Reference](#api-reference)
16. [Authentication Flow](#authentication-flow)
17. [Architecture Decisions](#architecture-decisions)
18. [Low-Level Q&A](#low-level-qa)
19. [Mid-Level Q&A](#mid-level-qa)
20. [High-Level Q&A](#high-level-qa)
21. [Known Limitations](#known-limitations)
22. [Future Scope](#future-scope)

---

## What is FinFlow?

FinFlow is a **production-ready personal finance dashboard** built as a complete full-stack web application with enterprise-level DevOps practices. It provides a clear, real-time picture of your financial health — tracking income, expenses, savings goals, budgets, and bills in one place.

**What makes FinFlow different:**
- 🐳 **Fully Dockerized** - One command deployment
- 🔄 **Automated CI/CD** - GitHub Actions pipeline with testing, security scanning, and deployment
- 🏗️ **Infrastructure as Code** - Terraform for AWS resource management
- ☁️ **Cloud-Native** - AWS S3 for file storage with presigned URLs
- 🔒 **Production Security** - HTTP-only cookies, bcrypt hashing, CORS protection
- 📊 **Real-Time Analytics** - Charts, reports, and PDF/CSV exports

The UI is inspired by modern fintech products like Stripe Dashboard, Revolut, and Mercury, with a clean minimal design, smooth animations, and full dark/light mode support.

---

## Why was it built?

Most people track finances in spreadsheets or don't track at all. Existing apps are either too complex, too expensive, or don't give developers insight into how they work. FinFlow was built to:

- Demonstrate a **production-grade full-stack project** with real DevOps practices
- Show complete **CI/CD pipeline implementation** with automated testing and deployment
- Implement **Infrastructure as Code** with Terraform for reproducible infrastructure
- Practice **containerization** with Docker for consistent deployments
- Showcase **cloud-native architecture** with AWS S3 integration
- Demonstrate real **authentication patterns** (JWT + HTTP-only cookies, email verification, password reset)
- Build something genuinely useful that showcases frontend, backend, database, infrastructure, and DevOps skills together

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
| Update Profile | Change name, upload avatar (AWS S3) |
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
- Receipt upload to AWS S3 with secure URLs
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
| PostgreSQL | 17 | Relational database (Supabase) |
| bcryptjs | latest | Password hashing |
| jsonwebtoken | latest | JWT creation and verification |
| cookie-parser | latest | Parse HTTP-only cookies |
| cors | latest | Cross-origin resource sharing |
| nodemailer | latest | Email sending |
| express-async-errors | latest | Async error propagation to error handler |
| dotenv | latest | Environment variable loading |
| nodemon | latest | Dev auto-restart |

### Cloud & Storage
| Technology | Version | Purpose |
|-----------|---------|---------|
| AWS S3 | latest | File storage (avatars, receipts) |
| @aws-sdk/client-s3 | latest | AWS S3 client |
| @aws-sdk/s3-request-presigner | latest | Presigned URL generation |
| multer-s3 | latest | S3 upload middleware |
| sharp | latest | Image processing |

### DevOps & Infrastructure
| Technology | Version | Purpose |
|-----------|---------|---------|
| Docker | latest | Containerization |
| Docker Compose | latest | Multi-container orchestration |
| Terraform | latest | Infrastructure as Code |
| GitHub Actions | latest | CI/CD pipeline |
| GitHub Container Registry | latest | Docker image registry |

### Development Tools
| Tool | Purpose |
|------|---------|
| ESLint | Code quality and linting |
| Prettier | Code formatting |
| Prisma Studio | Database GUI |
| Prisma Migrate | Database migrations |

---

## Architecture Overview

FinFlow follows a **modern cloud-native architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                          User Browser                            │
│                     http://localhost:3001                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js Frontend (Client)                    │
│  • React 19 + Next.js 15 App Router                             │
│  • Tailwind CSS + Framer Motion                                 │
│  • Recharts for data visualization                              │
│  • Axios for API communication                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ REST API (JSON)
                         │ JWT in HTTP-only Cookie
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Express Backend (Server)                      │
│  • RESTful API with JWT authentication                          │
│  • Prisma ORM for database access                               │
│  • Nodemailer for email notifications                           │
│  • Multer-S3 for file uploads                                   │
└────────┬──────────────────────────────────────┬─────────────────┘
         │                                       │
         │ Prisma Client                         │ AWS SDK
         ▼                                       ▼
┌──────────────────────┐              ┌───────────────────────────┐
│  PostgreSQL Database │              │      AWS S3 Bucket        │
│   (Supabase/Local)   │              │ finflow-uploads-xxx-2026  │
│                      │              │                           │
│  • User accounts     │              │  • Avatar images          │
│  • Transactions      │              │  • Receipt images         │
│  • Budgets & Goals   │              │  • Presigned URLs         │
│  • Bills & Settings  │              │  • Server-side encryption │
└──────────────────────┘              └───────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        DevOps Layer                              │
├─────────────────────────────────────────────────────────────────┤
│  Docker Containers:                                             │
│  • PostgreSQL container (development)                           │
│  • Server container (Node.js + Express)                         │
│  • Client container (Next.js)                                   │
├─────────────────────────────────────────────────────────────────┤
│  GitHub Actions CI/CD:                                          │
│  • Automated testing (unit + integration)                       │
│  • Docker image builds (multi-platform)                         │
│  • Security scanning (npm audit)                                │
│  • Automated deployments                                        │
├─────────────────────────────────────────────────────────────────┤
│  Terraform Infrastructure:                                      │
│  • AWS S3 bucket management                                     │
│  • IAM policies and permissions                                 │
│  • Infrastructure versioning                                    │
│  • GitHub OIDC integration (optional)                           │
└─────────────────────────────────────────────────────────────────┘
```

### Key Architecture Decisions

- **Containerization**: Docker Compose for development, production-ready Dockerfiles
- **Cloud Storage**: AWS S3 for scalable file storage instead of filesystem
- **Infrastructure as Code**: Terraform manages all AWS resources
- **Continuous Integration**: GitHub Actions automates testing and deployment
- **Security**: JWT in HTTP-only cookies, bcrypt password hashing, CORS protection
- **Database**: PostgreSQL with Prisma ORM for type-safe queries
- **Email**: Nodemailer with Gmail SMTP for transactional emails

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
    │   └── aws-s3.js                # AWS S3 configuration
    │
    ├── utils/
    │   ├── sendEmail.js             # Nodemailer transporter
    │   ├── emailTemplates.js        # HTML email templates
    │   ├── generateToken.js         # crypto.randomBytes token
    │   ├── defaultCategories.js     # Seed categories list
    │   ├── billReminder.js          # Daily reminder scheduler
    │   └── s3-helpers.js            # S3 delete & presigned URLs
    │
    ├── index.js                     # App entry point
    ├── nodemon.json                 # Dev watcher config
    └── .env                         # Environment variables (gitignored)
│
├── terraform/                       # Infrastructure as Code
│   ├── versions.tf                  # Terraform & provider versions
│   ├── provider.tf                  # AWS provider configuration
│   ├── variables.tf                 # Input variables
│   ├── terraform.tfvars.example     # Example values
│   ├── s3.tf                        # S3 bucket resources
│   ├── iam.tf                       # IAM policies and users
│   ├── outputs.tf                   # Output values
│   └── README.md                    # Terraform usage guide
│
├── .github/
│   ├── workflows/
│   │   ├── ci-cd.yml                # Main CI/CD pipeline
│   │   ├── docker-build.yml         # Docker image builds
│   │   ├── code-quality.yml         # Linting & security
│   │   ├── pr-preview.yml           # PR previews
│   │   ├── release.yml              # Automated releases
│   │   └── terraform.yml            # Terraform validation
│   └── dependabot.yml               # Automated dependency updates
│
├── docker-compose.yml               # Multi-container orchestration
├── Dockerfile.server                # Server container build
├── Dockerfile.client                # Client container build
└── .dockerignore                    # Docker build exclusions
```

---

## Getting Started

### Prerequisites

- **Node.js** 18 or higher (22 recommended)
- **PostgreSQL** 14 or higher (or use Supabase)
- **Docker & Docker Compose** (for containerized deployment)
- **Terraform** (optional, for infrastructure management)
- **Git**
- An **AWS Account** (for S3 file storage)
- A **Gmail** account with an App Password (for email sending)

### Installation Methods

You can run FinFlow in three ways:

1. **Docker (Recommended)** - One command, everything runs in containers
2. **Local Development** - Install dependencies and run locally
3. **Production Deployment** - Deploy with CI/CD pipeline

---

### Method 1: Docker (Quickest)

```bash
# 1. Clone the repository
git clone https://github.com/AnanyaRaj14/Fin_Flow.git
cd Fin_Flow

# 2. Create .env file with your credentials
cp .env.example .env
# Edit .env with your actual credentials

# 3. Start all services
docker compose up -d

# 4. View logs
docker compose logs -f

# 5. Open http://localhost:3001
```

**That's it!** The app is running with:
- PostgreSQL database on port 5432
- Backend API on http://localhost:5000
- Frontend on http://localhost:3001

---

### Method 2: Local Development

### Clone the repository

```bash
git clone https://github.com/AnanyaRaj14/Fin_Flow.git
cd Fin_Flow
```

### Install Dependencies

```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
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

# AWS S3 Configuration
AWS_REGION="ap-south-1"
AWS_ACCESS_KEY_ID="your-aws-access-key-id"
AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"
AWS_S3_BUCKET_NAME="finflow-uploads-xxx-2026"
```

> **Getting a Gmail App Password:**
> Go to Google Account → Security → 2-Step Verification → App Passwords → Generate one for "Mail"

> **Getting AWS S3 credentials:**
> See [AWS S3 File Storage](#aws-s3-file-storage) section below for complete setup guide.

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

## AWS S3 File Storage

FinFlow uses **AWS S3** for storing user avatars and transaction receipt images. This provides scalable, secure, and cost-effective file storage.

### Why AWS S3?

- ✅ **Scalable**: No storage limits
- ✅ **Secure**: Server-side encryption, presigned URLs
- ✅ **Cost-effective**: Pay only for what you use (~$2-5/month for typical usage)
- ✅ **Fast**: Global CDN distribution
- ✅ **Reliable**: 99.999999999% (11 nines) durability

### Quick Setup (5 minutes)

1. **Create AWS Account**: https://aws.amazon.com
2. **Create S3 Bucket**:
   - Go to S3 console
   - Click "Create bucket"
   - Name: `finflow-uploads-yourname-2026`
   - Region: Choose closest to you (e.g., `us-east-1`)
   - Block all public access: ✅ Enabled
   - Encryption: SSE-S3 (default)
   - Create bucket

3. **Configure CORS**:
   ```json
   [
       {
           "AllowedHeaders": ["*"],
           "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
           "AllowedOrigins": ["http://localhost:3001"],
           "ExposeHeaders": ["ETag"],
           "MaxAgeSeconds": 3000
       }
   ]
   ```

4. **Create IAM User**:
   - Go to IAM → Users → Create user
   - Name: `finflow-s3-user`
   - Attach policy: `AmazonS3FullAccess` (or custom restrictive policy)
   - Create access key
   - **Save the credentials!**

5. **Update `.env`**:
   ```env
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=...
   AWS_S3_BUCKET_NAME=finflow-uploads-yourname-2026
   ```

### Complete Setup Guide

See **[AWS-S3-SETUP-GUIDE.md](./AWS-S3-SETUP-GUIDE.md)** for:
- Step-by-step AWS console walkthrough
- Security best practices
- IAM policy recommendations
- Cost optimization tips
- Troubleshooting

### How It Works

```
User uploads file
    ↓
Frontend sends multipart/form-data
    ↓
Backend receives via Multer
    ↓
multer-s3 streams directly to S3
    ↓
S3 returns secure URL
    ↓
URL saved in database
    ↓
Frontend requests presigned URL for display
```

**Security**: Files are private by default. Frontend uses temporary presigned URLs (valid for 1 hour) to display images.

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

---

## Docker Deployment

FinFlow is **fully dockerized** for consistent deployment across environments.

### Quick Start

```bash
# Start all services (database, server, client)
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Rebuild after code changes
docker compose up --build -d
```

### What Gets Created

| Container | Service | Port | Purpose |
|-----------|---------|------|---------|
| `finflow_db` | PostgreSQL 17 | 5432 | Database |
| `finflow_server` | Node.js + Express | 5000 | Backend API |
| `finflow_client` | Next.js 15 | 3001 | Frontend |

### Container Features

- ✅ **Health checks**: Automatic restart if unhealthy
- ✅ **Volumes**: Database data persists across restarts
- ✅ **Networks**: Containers communicate via internal network
- ✅ **Auto-migrations**: Prisma migrations run on server start
- ✅ **Hot reload**: Code changes reflect immediately (dev mode)

### Docker Commands Reference

```bash
# View container status
docker compose ps

# View logs for specific service
docker compose logs server -f
docker compose logs client -f
docker compose logs postgres -f

# Restart specific service
docker restart finflow_server

# Enter container shell
docker exec -it finflow_server sh

# Check database tables
docker exec -it finflow_db psql -U postgres -d finflow -c "\dt"

# Clean everything (including volumes)
docker compose down -v
docker system prune -af

# Pull latest images
docker compose pull
```

### Production Deployment

```bash
# Build production images
docker compose -f docker-compose.prod.yml build

# Push to registry
docker tag finflow_server ghcr.io/ananyaraj14/finflow/server:latest
docker tag finflow_client ghcr.io/ananyaraj14/finflow/client:latest
docker push ghcr.io/ananyaraj14/finflow/server:latest
docker push ghcr.io/ananyaraj14/finflow/client:latest
```

### Verification Checklist

- [ ] All 3 containers running (`docker compose ps`)
- [ ] http://localhost:5000/api/health returns `{"status":"ok"}`
- [ ] http://localhost:3001 loads the frontend
- [ ] Can register and login
- [ ] Files upload successfully
- [ ] Database persists after restart

See **[DOCKER-VERIFICATION.md](./DOCKER-VERIFICATION.md)** for complete testing guide.

---

## Terraform Infrastructure

FinFlow uses **Terraform** for Infrastructure as Code to manage AWS resources.

### What Terraform Manages

- ✅ **S3 Bucket**: File storage configuration
- ✅ **S3 Encryption**: Server-side encryption (SSE-S3)
- ✅ **S3 Versioning**: File version history
- ✅ **S3 CORS**: Cross-origin access rules
- ✅ **S3 Public Access Block**: Security hardening
- ✅ **IAM Policies**: Least-privilege access policies
- ✅ **IAM Users**: Application service accounts
- ✅ **GitHub OIDC**: Secure CI/CD authentication (optional)

### Quick Start

```bash
# 1. Install Terraform
# macOS: brew install terraform
# Windows: choco install terraform
# Or download from: https://terraform.io/downloads

# 2. Navigate to terraform directory
cd terraform

# 3. Create terraform.tfvars from example
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

# 4. Initialize Terraform
terraform init

# 5. Import existing resources (IMPORTANT!)
terraform import aws_s3_bucket.uploads finflow-uploads-xxx-2026
terraform import aws_s3_bucket_versioning.uploads finflow-uploads-xxx-2026
terraform import aws_s3_bucket_server_side_encryption_configuration.uploads finflow-uploads-xxx-2026
terraform import aws_s3_bucket_public_access_block.uploads finflow-uploads-xxx-2026
terraform import aws_s3_bucket_cors_configuration.uploads finflow-uploads-xxx-2026

# 6. Review changes
terraform plan

# 7. Apply changes
terraform apply
```

### Terraform Features

- 🔒 **Safe imports**: Manages existing resources without recreating
- 🛡️ **Destroy protection**: `prevent_destroy = true` on S3 bucket
- 🔐 **No secrets in code**: Uses environment variables
- 📝 **State management**: Track infrastructure changes
- 🔄 **Idempotent**: Safe to run multiple times

### Terraform Structure

```
terraform/
├── versions.tf       # Provider versions & backend config
├── provider.tf       # AWS provider with tags
├── variables.tf      # Input variables
├── terraform.tfvars  # Your actual values
├── s3.tf            # S3 bucket resources
├── iam.tf           # IAM policies and users
├── outputs.tf       # Output values
└── README.md        # Usage guide
```

### Why Terraform?

- **Version Control**: Infrastructure changes tracked in Git
- **Reproducible**: Same configuration creates identical infrastructure
- **Team Collaboration**: Share infrastructure definitions
- **Documentation**: Code is documentation
- **Safety**: Plan before apply, prevent accidental changes

See **[TERRAFORM-GUIDE.md](./TERRAFORM-GUIDE.md)** for complete setup and usage.

---

## CI/CD Pipeline

FinFlow has a **complete CI/CD pipeline** using GitHub Actions.

### Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **ci-cd.yml** | Push to `main`, PRs | Full pipeline: test → build → scan → deploy |
| **docker-build.yml** | Push to `main`, tags | Build and push Docker images |
| **code-quality.yml** | Every push | ESLint, security audit, dependency check |
| **pr-preview.yml** | Pull requests | Build preview, comment status on PR |
| **release.yml** | Version tags (`v*.*.*`) | Create releases with changelog |
| **terraform.yml** | Terraform file changes | Validate Terraform configuration |

### CI/CD Pipeline Flow

```
Push to main
    ↓
Run Tests
  ├─ Server unit tests
  └─ Client build test
    ↓
Code Quality
  ├─ ESLint checks
  └─ Security audit
    ↓
Build Docker Images
  ├─ Server image
  └─ Client image
    ↓
Security Scan
  └─ Container vulnerability check
    ↓
Deploy
  └─ Push to production
```

### GitHub Actions Features

- ✅ **Automated Testing**: Every commit is tested
- ✅ **Docker Builds**: Multi-platform images (amd64, arm64)
- ✅ **Security Scanning**: Dependency vulnerabilities detected
- ✅ **Automated Releases**: Version tags create GitHub releases
- ✅ **Dependabot**: Weekly dependency update PRs
- ✅ **PR Previews**: Build status commented on pull requests

### Setup (One-time)

1. **Enable GitHub Actions**:
   - Go to Settings → Actions → General
   - Allow all actions
   - Save

2. **Enable Container Registry**:
   - Go to Settings → Packages
   - Enable package creation

3. **Add Deployment Secrets (Optional)**:
   ```
   AWS_ACCESS_KEY_ID
   AWS_SECRET_ACCESS_KEY
   VPS_SSH_KEY
   VERCEL_TOKEN
   ```

4. **Push and watch**:
   ```bash
   git push origin main
   # Go to Actions tab to see workflows running
   ```

### Status Badges

Add these to your README (already added above):

```markdown
![CI/CD](https://github.com/AnanyaRaj14/finflow/actions/workflows/ci-cd.yml/badge.svg)
![Docker Build](https://github.com/AnanyaRaj14/finflow/actions/workflows/docker-build.yml/badge.svg)
![Code Quality](https://github.com/AnanyaRaj14/finflow/actions/workflows/code-quality.yml/badge.svg)
```

### Docker Images

Your images are published to GitHub Container Registry:

```bash
# Pull images
docker pull ghcr.io/ananyaraj14/finflow/server:latest
docker pull ghcr.io/ananyaraj14/finflow/client:latest

# Run with pulled images
docker run -p 5000:5000 ghcr.io/ananyaraj14/finflow/server:latest
```

See **[CI-CD-GUIDE.md](./CI-CD-GUIDE.md)** for complete documentation.

---

## Production Deployment

### Deployment Options

#### Option 1: Docker on VPS (Recommended)

```bash
# On your VPS
git clone https://github.com/AnanyaRaj14/Fin_Flow.git
cd Fin_Flow
cp .env.example .env
# Edit .env with production values
docker compose up -d
```

**Providers**: DigitalOcean, Linode, AWS EC2, Google Cloud Compute

---

#### Option 2: Vercel (Frontend) + Railway (Backend)

**Frontend to Vercel**:
```bash
cd client
vercel deploy --prod
```

**Backend to Railway**:
1. Connect GitHub repository
2. Railway auto-deploys on push
3. Add environment variables in dashboard

---

#### Option 3: AWS ECS (Elastic Container Service)

1. Push images to ECR or GitHub Container Registry
2. Create ECS cluster
3. Define task definitions
4. Create services
5. GitHub Actions auto-deploys

See `.github/workflows/ci-cd.yml` for deployment examples.

---

## Production Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Update `CLIENT_URL` to your production domain
- [ ] Configure production database (not localhost)
- [ ] Add production domain to S3 CORS configuration
- [ ] Set up SSL/TLS certificates (Let's Encrypt)
- [ ] Enable GitHub Actions deployment
- [ ] Configure monitoring (Sentry, LogRocket)
- [ ] Set up backups (database + S3)
- [ ] Review Terraform infrastructure
- [ ] Test all features in production
- [ ] Set up custom domain with DNS
- [ ] Enable rate limiting on API
- [ ] Configure log aggregation
- [ ] Set up alerts for errors

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

This mimics a real production setup where frontend and backend are independently deployable. The client can be deployed to Vercel and the server to Railway, Render, or a VPS — completely separate. This also works great with Docker where each service has its own container.

### Why AWS S3 instead of Cloudinary for file uploads?

AWS S3 provides more control, better pricing at scale, and is industry-standard for cloud storage. S3 integrates seamlessly with Terraform for infrastructure management and supports advanced features like lifecycle policies, versioning, and encryption. Multer streams files directly to S3 without saving to disk first.

### Why Terraform for infrastructure management?

Terraform allows infrastructure to be version-controlled, peer-reviewed, and reproducibly deployed. Changes are tracked in Git, teams can collaborate on infrastructure, and resources can be safely imported without recreation. The `prevent_destroy` flag on critical resources prevents accidental deletion.

### Why Docker and Docker Compose?

Docker ensures "it works on my machine" becomes "it works everywhere". Containers package the app with all dependencies, eliminating environment inconsistencies. Docker Compose orchestrates multiple containers (database, server, client) with a single command, making development and deployment consistent.

### Why GitHub Actions for CI/CD?

GitHub Actions is integrated directly into GitHub, provides free CI/CD for public repos, and supports Docker, Terraform, and deployment to any cloud provider. Workflows are defined as code in `.github/workflows/`, making them version-controlled and reviewable. The built-in container registry (ghcr.io) simplifies Docker image management.

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
A: Multer intercepts the multipart/form-data request. `multer-s3` provides a custom storage engine that pipes the file stream directly to AWS S3's upload API. The returned S3 URL (`req.file.location`) is stored in the `Transaction.receiptUrl` field. No file ever touches the server's disk. When displaying images, the backend generates presigned URLs (valid for 1 hour) for secure access.

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

**Q: How does Docker ensure all services start in the correct order?**
A: Docker Compose uses `depends_on` with health checks. The server waits for the database to be "healthy" (accepting connections) before starting. The `entrypoint.sh` script runs Prisma migrations after the database is ready. Health checks poll services until they respond correctly, preventing "connection refused" errors from premature starts.

**Q: How does Terraform import existing resources without recreating them?**
A: Terraform's `import` command maps existing AWS resources to Terraform resource definitions without modifying them. After import, Terraform tracks the resource in its state file. Future `terraform apply` operations only update changed attributes. The `prevent_destroy` lifecycle rule ensures critical resources like S3 buckets cannot be accidentally deleted.

**Q: How does the CI/CD pipeline know when to deploy?**
A: The `ci-cd.yml` workflow has conditions: `if: github.ref == 'refs/heads/main'` ensures deployment only runs on the main branch (not PRs or other branches). The workflow first runs tests, then builds Docker images, then optionally deploys. If any step fails, the pipeline stops and deployment doesn't happen.

**Q: Why use `router.replace` instead of `router.push` for redirects?**
A: `replace` doesn't add an entry to the browser history stack. If a user is redirected from `/dashboard` to `/login`, pressing Back shouldn't take them back to the dashboard (which would show the loading spinner and redirect again). `replace` overwrites the current history entry.

**Q: How does the CSV export work without a library?**
A: The report data returned from the API is mapped into a 2D array. Each row is joined with commas and rows are joined with newlines. A `Blob` is created with `type: 'text/csv'`, a temporary `<a>` element is created with `href: URL.createObjectURL(blob)`, programmatically clicked, then the object URL is revoked.

---

## High-Level Q&A

**Q: What is the overall architecture of the application?**
A: FinFlow uses a **modern cloud-native microservices architecture**. The Next.js frontend is a SPA that communicates with an Express backend via RESTful JSON API. Authentication uses JWTs in HTTP-only cookies. PostgreSQL stores structured data via Prisma ORM. AWS S3 stores unstructured data (files). The entire stack is containerized with Docker for consistent deployment. Infrastructure is managed as code with Terraform. GitHub Actions automates testing, building, security scanning, and deployment.

**Q: How does the data flow from a user action to the screen?**

```
User clicks "Add Transaction"
  → React Hook Form validates input
  → TransactionForm creates FormData (supports file upload)
  → Axios POSTs to /api/transactions
  → Auth middleware verifies JWT from cookie
  → transactionController creates Transaction record
  → If receipt file: multer-s3 uploads to S3, saves URL
  → Account.balance updated atomically
  → Budget.spent updated if expense
  → Returns created transaction with category and account populated
  → Frontend updates local state (no full page reload)
  → Toast notification shown
  → Dashboard stats become stale → user refreshes to see updates
```

**Q: How would you scale this application for millions of users?**
A: The current architecture already supports horizontal scaling:

**Application Layer**:
- Deploy multiple server instances behind a load balancer (AWS ALB, Nginx)
- Use stateless authentication (JWT) so any instance can handle any request
- Move file uploads directly from client to S3 (presigned POST URLs)

**Database Layer**:
- Use connection pooling (PgBouncer) to handle more connections
- Enable read replicas for reporting queries
- Implement database sharding by user ID for write scaling
- Move hot data to Redis (sessions, frequently accessed records)

**Job Processing**:
- Move bill reminders from `setInterval` to a queue (Bull, SQS)
- Process emails asynchronously
- Use separate worker containers for background jobs

**Infrastructure**:
- Deploy to Kubernetes for auto-scaling
- Use CloudFront/CloudFlare CDN for static assets
- Implement rate limiting per user (Redis + express-rate-limit)
- Add Elasticsearch for fast transaction search
- Use Terraform modules for multi-region deployment

**Observability**:
- Add APM (Datadog, New Relic)
- Centralized logging (CloudWatch, ELK stack)
- Distributed tracing (OpenTelemetry)
- Real-time error tracking (Sentry)

**Q: What are the security considerations in this app?**

| Threat | Mitigation |
|--------|-----------|
| XSS stealing tokens | JWT in HTTP-only cookie (not localStorage) |
| CSRF attacks | `sameSite: lax` cookie flag |
| SQL injection | Prisma uses parameterised queries exclusively |
| Password exposure | bcrypt hashing (cost factor 12), never logged |
| Email enumeration | Forgot password always returns same message |
| Brute force login | Rate limiting via GitHub Actions IP blocks |
| Insecure file uploads | S3 presigned URLs, private buckets, file type validation |
| Expired tokens | Verify/reset tokens have expiry timestamps |
| Secrets in code | All secrets in `.env`, gitignored, never committed |
| Infrastructure drift | Terraform state tracks all changes |
| Container vulnerabilities | GitHub Actions security scanning |
| Dependency vulnerabilities | Dependabot weekly scans + npm audit |
| Unauthorized AWS access | IAM least-privilege policies, no root account usage |

**Q: How does the DevOps pipeline ensure quality?**

```
Developer pushes code
    ↓
GitHub Actions triggered
    ↓
┌──────────────────────────┐
│   Automated Testing      │
│  ✓ Server unit tests     │
│  ✓ Client build tests    │
│  ✓ Database migrations   │
└──────────┬───────────────┘
           ↓
┌──────────────────────────┐
│   Code Quality Checks    │
│  ✓ ESLint violations     │
│  ✓ Security audit        │
│  ✓ Dependency versions   │
└──────────┬───────────────┘
           ↓
┌──────────────────────────┐
│   Build Docker Images    │
│  ✓ Multi-platform builds │
│  ✓ Layer caching         │
│  ✓ Tag with commit SHA   │
└──────────┬───────────────┘
           ↓
┌──────────────────────────┐
│   Security Scanning      │
│  ✓ Container vulns       │
│  ✓ Image signing         │
└──────────┬───────────────┘
           ↓
┌──────────────────────────┐
│   Deploy to Production   │
│  ✓ Push to registry      │
│  ✓ Update running conts  │
│  ✓ Health checks         │
│  ✓ Rollback if failure   │
└──────────────────────────┘
```

If **any step fails**, the pipeline stops and deployment doesn't happen.

**Q: What is the difference between the `(auth)` and `(dashboard)` route groups?**
A: These are Next.js App Router **route groups** (parentheses don't affect the URL). `(auth)` uses a centered layout for login/register pages with no sidebar. `(dashboard)` wraps all protected pages in `DashboardLayout` which includes the sidebar, header, and authentication guard. The layout runs once for all child routes, preventing unnecessary re-renders.

**Q: How would you add a new feature to this application?**

```
1. Branch Strategy
   git checkout -b feature/new-feature

2. Backend Changes
   - Update Prisma schema if database change needed
   - Run migration: npx prisma migrate dev
   - Add controller logic
   - Add API route
   - Test with Postman/curl

3. Frontend Changes
   - Create/update components
   - Add API service function in services/api.js
   - Integrate with existing pages
   - Add to sidebar navigation if needed

4. Test Locally
   - npm run dev (both server and client)
   - Test all CRUD operations
   - Check responsive design
   - Verify dark/light mode

5. Docker Test
   - docker compose up --build
   - Verify feature works in containers

6. Create Pull Request
   - GitHub Actions runs tests
   - Code quality checks pass
   - Security scan passes
   - Request review

7. Merge & Deploy
   - Merge to main
   - GitHub Actions auto-deploys
   - Monitor logs for errors
   - Verify in production
```

**Q: How does the project handle environment-specific configurations?**

A: **Development**:
```
.env (local database, localhost URLs)
docker-compose.yml (development setup)
nodemon for hot reload
```

**Production**:
```
.env.production (production database, real URLs)
docker-compose.prod.yml (optimized builds)
Terraform manages infrastructure
GitHub Actions deploys
```

Environment variables are injected at:
- **Build time**: `NEXT_PUBLIC_*` variables (client-side)
- **Runtime**: All other variables (server-side only)
- **Container runtime**: Docker Compose or Kubernetes ConfigMaps

**Q: What monitoring and observability features would you add?**

**Application Monitoring**:
- Add winston/pino for structured logging
- Send logs to CloudWatch or Datadog
- Track response times per endpoint
- Monitor database query performance

**Error Tracking**:
- Integrate Sentry for error reporting
- Track error frequency and patterns
- Alert on error rate spikes
- Source maps for meaningful stack traces

**User Analytics**:
- Track feature usage (Mixpanel, Amplitude)
- Monitor user flows
- Identify bottlenecks
- A/B test new features

**Infrastructure**:
- CPU/memory/disk usage per container
- Database connection pool stats
- S3 request metrics
- API rate limiting stats

**Business Metrics**:
- Total users registered
- Daily/monthly active users
- Average transactions per user
- File upload success rate

---

## Known Limitationsext.js **route groups** — parentheses mean the folder name doesn't appear in the URL. They exist purely to share layouts. `(auth)` applies a centered full-screen background layout. `(dashboard)` applies the sidebar + header shell and the `ProtectedLayout` auth guard. Both groups can have routes at the same URL depth without conflicting.

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

### Completed ✅
- [x] **Dockerization** - Full Docker Compose setup
- [x] **CI/CD Pipeline** - GitHub Actions automation
- [x] **Infrastructure as Code** - Terraform for AWS
- [x] **Cloud Storage** - AWS S3 integration
- [x] **Automated Testing** - In CI/CD pipeline
- [x] **Security Scanning** - Vulnerability detection
- [x] **Container Registry** - GitHub Container Registry

### Planned Features 🚀

#### Phase 1: Enhanced Features
- [ ] **Multi-currency support** - Real-time exchange rates
- [ ] **Bank account integration** - Plaid API for automatic transaction sync
- [ ] **Receipt OCR** - Extract data from receipt images
- [ ] **Mobile app** - React Native or Flutter
- [ ] **Recurring transactions** - Auto-create monthly expenses
- [ ] **Bill payment reminders** - SMS/push notifications
- [ ] **Split expenses** - Track shared costs

#### Phase 2: Advanced Analytics
- [ ] **AI-powered insights** - Spending pattern analysis
- [ ] **Budget recommendations** - ML-based suggestions
- [ ] **Financial health score** - Overall financial wellness metric
- [ ] **Predictive analytics** - Forecast future expenses
- [ ] **Custom reports** - User-defined report templates
- [ ] **Export to accounting software** - QuickBooks, Xero integration

#### Phase 3: Collaboration
- [ ] **Multi-user support** - Family/household accounts
- [ ] **Shared budgets** - Collaborate on financial goals
- [ ] **Permission management** - View-only, edit, admin roles
- [ ] **Activity audit log** - Track who changed what

#### Phase 4: Infrastructure Enhancements
- [ ] **Kubernetes deployment** - Auto-scaling, high availability
- [ ] **Multi-region deployment** - Global CDN, geo-routing
- [ ] **Microservices architecture** - Separate services for core features
- [ ] **Event-driven architecture** - Kafka/RabbitMQ for async processing
- [ ] **GraphQL API** - Alternative to REST
- [ ] **Caching layer** - Redis for frequently accessed data
- [ ] **CDN integration** - CloudFront for static assets

#### Phase 5: Monitoring & Observability
- [ ] **APM integration** - Datadog, New Relic
- [ ] **Real-time dashboards** - Grafana monitoring
- [ ] **Error tracking** - Sentry integration
- [ ] **Log aggregation** - ELK stack or CloudWatch
- [ ] **Performance monitoring** - Response time tracking
- [ ] **Uptime monitoring** - StatusPage integration

#### Phase 6: Security Enhancements
- [ ] **2FA/MFA** - Two-factor authentication
- [ ] **OAuth providers** - Google, GitHub login
- [ ] **API rate limiting** - Per-user request limits
- [ ] **WAF integration** - AWS WAF or Cloudflare
- [ ] **Secrets rotation** - Automated credential rotation
- [ ] **Compliance** - SOC 2, GDPR readiness
- [ ] **Penetration testing** - Regular security audits

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Commit Convention**: Use [Conventional Commits](https://www.conventionalcommits.org/)
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Build process or auxiliary tool changes

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Recharts](https://recharts.org/) - Charting library
- [Radix UI](https://www.radix-ui.com/) - Accessible components
- [AWS](https://aws.amazon.com/) - Cloud infrastructure
- [Docker](https://www.docker.com/) - Containerization
- [Terraform](https://www.terraform.io/) - Infrastructure as Code
- [GitHub Actions](https://github.com/features/actions) - CI/CD

---

## Contact

**Ananya Raj**
- GitHub: [@AnanyaRaj14](https://github.com/AnanyaRaj14)
- LinkedIn: [Ananya Raj](https://www.linkedin.com/in/ananya-raj-/)
- Email: ananyaraj@example.com

---

## Project Links

- **Repository**: https://github.com/AnanyaRaj14/Fin_Flow
- **Issues**: https://github.com/AnanyaRaj14/Fin_Flow/issues
- **Discussions**: https://github.com/AnanyaRaj14/Fin_Flow/discussions

---

<div align="center">

**⭐ If you found this project helpful, please consider giving it a star! ⭐**

Made with ❤️ by Ananya Raj

</div>

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
