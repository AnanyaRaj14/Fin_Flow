# 🏛️ FinFlow — Complete Architecture, Deployment & Interview Guide

> **FinFlow** is an enterprise-grade, full-stack personal finance and wealth management platform built with modern cloud-native principles, Infrastructure as Code (Terraform), and a distributed AWS architecture.

---

## 📑 Table of Contents
1. [High-Level System Architecture](#1-high-level-system-architecture)
2. [End-to-End Traffic & Data Flow](#2-end-to-end-traffic--data-flow)
3. [Component-by-Component Breakdown](#3-component-by-component-breakdown)
   - [Frontend (Next.js 16 SPA / Static Export)](#frontend-layer)
   - [Backend (Node.js / Express / PM2)](#backend-layer)
   - [Database Layer (Supabase PostgreSQL / Prisma ORM)](#database-layer)
   - [Object Storage (AWS S3 & Pre-signed URLs)](#storage-layer)
4. [Infrastructure as Code (Terraform)](#4-infrastructure-as-code-terraform)
5. [Production Deployment Runbook (Step-by-Step)](#5-production-deployment-runbook)
6. [Security, Performance & Resilience Design](#6-security-performance--resilience-design)
7. [🎯 System Design & Technical Interview Q&A](#7--system-design--technical-interview-qa)

---

## 1. High-Level System Architecture

FinFlow utilizes a **decoupled hybrid cloud architecture** combining AWS edge caching, serverless static hosting, containerized/VM compute, and managed database services.

![FinFlow System Architecture](docs/images/finflow_system_architecture.jpg)

---

## 2. End-to-End Traffic & Data Flow

```text
                                  ┌───────────────────────────────┐
                                  │      Client Web Browser       │
                                  └───────────────┬───────────────┘
                                                  │ HTTPS / 443
                                                  ▼
                                  ┌───────────────────────────────┐
                                  │    AWS CloudFront (CDN)       │
                                  │   d2brh5vq2pqdaz.cloudfront   │
                                  └───────┬───────────────┬───────┘
                                          │               │
                     Route: /* (Static)   │               │ Route: /api/* (Dynamic)
                                          ▼               ▼
                 ┌────────────────────────────┐       ┌────────────────────────────┐
                 │  AWS S3 (Frontend Bucket)  │       │  AWS EC2 Backend Server    │
                 │  • index.html              │       │  • Node.js + Express       │
                 │  • dashboard.html          │       │  • PM2 Daemon (:5000)      │
                 │  • _next/static JS & CSS   │       └─────────────┬──────────────┘
                 └────────────────────────────┘                     │
                                                   ┌────────────────┼────────────────┐
                                                   ▼                ▼                ▼
                                      ┌────────────────┐   ┌────────────────┐  ┌───────────┐
                                      │  Supabase DB   │   │  AWS S3 Media  │  │ Gmail     │
                                      │  • PostgreSQL  │   │  • Avatars     │  │ SMTP      │
                                      │  • PgBouncer   │   │  • Receipts    │  │ Reminders │
                                      └────────────────┘   └────────────────┘  └───────────┘
```

1. **User Request**: Browser navigates to `https://d2brh5vq2pqdaz.cloudfront.net`.
2. **Edge Routing**:
   - **Static Assets (`/*`)**: CloudFront fetches from the private S3 bucket using **Origin Access Control (OAC)** with zero latency.
   - **API Requests (`/api/*`)**: CloudFront forwards API requests directly to the EC2 backend instance (`http://<ec2-ip>:5000/api/*`).
3. **Database Operations**: Express communicates with Supabase PostgreSQL using **Prisma ORM** via PgBouncer connection pooling.
4. **Media Handling**: Profile photos and receipts are uploaded directly to the private S3 bucket (`finfine-uploads-2026`). Pre-signed temporary URLs (valid for 7 days) are generated on-the-fly for secure viewing.
5. **Background Automation**: A background cron engine checks for upcoming bills every 24 hours and on bill creation, sending reminder emails via Nodemailer SMTP.

---

## 3. Component-by-Component Breakdown

### Frontend Layer
- **Framework**: Next.js 16 (App Router) + React 19 + Tailwind CSS + Radix UI.
- **Export Mode**: Static HTML export (`output: "export"`).
- **Client Routing**: Configured with custom error routing in CloudFront (`404/403 -> /index.html`) enabling single-page app client-side navigation.
- **HTTP Client**: Axios with interceptors for global 401 handling, auto-cookie credentials (`withCredentials: true`), and dynamic base URL routing.

### Backend Layer
- **Framework**: Node.js, Express.js.
- **Process Manager**: **PM2** (Process Manager 2) for zero-downtime clustering, auto-restart on failure, and persistence across server reboots.
- **Security & Middleware**:
  - `bcryptjs` for password hashing with 12 salt rounds.
  - `jsonwebtoken` (JWT) for authentication via HTTP-only secure cookies.
  - `multer` + `multer-s3` for file upload handling.
  - Custom error handling middleware and centralized async wrapper (`express-async-errors`).

### Database Layer
- **Provider**: **Supabase Managed PostgreSQL 17**.
- **ORM**: **Prisma ORM 6**.
- **Connection Architecture**:
  - `DATABASE_URL` (Port 6543): Transaction-mode pooler with PgBouncer for high-frequency queries.
  - `DIRECT_URL` (Port 5432): Direct connection for migrations (`prisma db push`).
- **Data Models**:
  - `User`: Accounts, auth state, verification tokens, preferences.
  - `Account`: Bank accounts, digital wallets, cash balances.
  - `Transaction`: Income, expenses, category relations, receipt URLs.
  - `Budget`: Monthly category limits and real-time spent tracking.
  - `Goal`: Savings targets, deadlines, progress tracking, and auto-completion.
  - `Bill`: Recurring bill management, due date tracking, and notification flags.

### Storage Layer
- **Provider**: **AWS S3** (`finfine-uploads-2026`).
- **Security Model**: **100% Private (Block Public Access enabled)**.
- **Pre-Signed URL Generator** (`server/utils/s3Presigner.js`):
  - Uses AWS SDK v3 `@aws-sdk/s3-request-presigner` (`GetObjectCommand`).
  - Generates secure URLs on-the-fly when reading avatars and receipts.
  - Prevents public data scraping while allowing users to view their media seamlessly.

---

## 4. Infrastructure as Code (Terraform)

All infrastructure is codified into reusable, production-ready Terraform configuration modules:

```text
terraform/
├── provider.tf            # AWS Provider with default tags and region
├── versions.tf            # Terraform and AWS provider versions
├── variables.tf           # Project variables (region, instance type, bucket names)
├── s3.tf                  # Frontend S3 (OAC policy) + Uploads S3 (CORS, Encryption)
├── cloudfront.tf          # CDN, OAC, multi-origin routing (/ and /api/*), SSL/TLS
├── ec2.tf                 # Ubuntu 24.04 LTS instance, Security Groups (22, 80, 5000)
├── outputs.tf             # CDN domain, EC2 Public IP, S3 bucket names
├── terraform.tfvars       # Configuration values
└── terraform.tfvars.example
```

### Key Terraform Architectural Highlights:
1. **Origin Access Control (OAC)**: Replaced legacy OAI with modern SigV4 signing for S3 origins.
2. **Multi-Origin CloudFront**: Single CDN domain handles both static assets (S3) and dynamic API traffic (EC2).
3. **Security Group Hardening**: Restricts inbound ports to SSH (22), HTTP (80), and Express API (5000).

---

## 5. Production Deployment Runbook

![FinFlow Deployment Pipeline](docs/images/finflow_deployment_pipeline.jpg)

### Step 1: Provision Infrastructure with Terraform
```bash
cd terraform
terraform init
terraform plan
terraform apply -auto-approve
```

### Step 2: Build and Deploy Frontend to S3
```bash
# 1. Build static export
cd ../client
npm install
npm run build   # Generates client/out/

# 2. Sync files to private S3 frontend bucket
aws s3 sync out/ s3://finflow-frontend-ananya-tf/ --delete
```

### Step 3: Deploy Backend on EC2
1. **Connect to EC2** via AWS EC2 Instance Connect (or SSH).
2. **Execute Deployment Script**:
```bash
# Install Node.js 20 & PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git
sudo npm install -g pm2

# Clone and setup application
git clone https://github.com/AnanyaRaj14/Fin_Flow.git
cd Fin_Flow/server
npm install

# Setup environment variables
cat << 'EOF' > .env
PORT=5000
NODE_ENV=production
DATABASE_URL="postgresql://postgres.[project-ref]:[db-password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[db-password]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
JWT_SECRET=your_very_long_random_jwt_secret_here
JWT_EXPIRE=7d
CLIENT_URL=https://d2brh5vq2pqdaz.cloudfront.net
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-character-gmail-app-password
FROM_EMAIL=FinFlow <your-gmail@gmail.com>
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_S3_BUCKET_NAME=finfine-uploads-2026
EOF

# Initialize Prisma client and push schema
npx prisma generate
npx prisma db push

# Start background process with PM2
pm2 delete all 2>/dev/null || true
pm2 start index.js --name "finflow-backend"
pm2 save
pm2 startup
```

### Step 4: Verify System Health
```bash
# Verify backend response
curl http://localhost:5000/api/health
# Response: {"status":"ok"}

# Verify CloudFront public endpoint
curl -I https://d2brh5vq2pqdaz.cloudfront.net
# Response: HTTP/2 200
```

---

## 6. Security, Performance & Resilience Design

```text
┌────────────────────────┬──────────────────────────────────────────────────────────┐
│ Security Domain        │ Implementation Strategy                                  │
├────────────────────────┼──────────────────────────────────────────────────────────┤
│ Zero Public S3 Access  │ S3 Block Public Access is ON. Media accessed solely via  │
│                        │ AWS SigV4 pre-signed URLs with expiry limits.            │
├────────────────────────┼──────────────────────────────────────────────────────────┤
│ Auth & Tokens          │ Passwords hashed with bcrypt (12 rounds). JWTs stored in │
│                        │ HttpOnly, SameSite=Lax cookies to mitigate XSS and CSRF. │
├────────────────────────┼──────────────────────────────────────────────────────────┤
│ Edge Caching & Speed   │ CloudFront caches static bundles globally at edge nodes, │
│                        │ reducing origin load to near zero for frontend assets.   │
├────────────────────────┼──────────────────────────────────────────────────────────┤
│ Process Resilience     │ PM2 automatically monitors, load-balances, and restarts   │
│                        │ the Express process in <100ms if an exception occurs.    │
└────────────────────────┴──────────────────────────────────────────────────────────┘
```

---

## 7. 🎯 System Design & Technical Interview Q&A

### Q1: Why use CloudFront with multi-origin routing instead of serving frontend files from the EC2 server?
> **Answer**:
> Serving frontend static assets from CloudFront + S3 provides three major advantages:
> 1. **Global Low Latency**: CloudFront caches HTML/JS/CSS at 400+ Edge Locations worldwide, giving users <50ms load times regardless of geographic location.
> 2. **Compute Offloading**: The EC2 instance only handles compute-heavy business logic and database transactions, freeing up 80%+ of CPU and RAM.
> 3. **Cost & Scalability**: S3 + CloudFront scales infinitely without needing server upgrades or autoscaling load balancers for static traffic.

---

### Q2: How did you securely handle private media uploads (receipts/avatars) in S3 without making the bucket public?
> **Answer**:
> The S3 bucket has **Block Public Access enabled**. When a user requests their profile or transaction list, the backend uses AWS SDK v3 `@aws-sdk/s3-request-presigner` to generate a **cryptographically signed pre-signed URL** (`GetObjectCommand`).
> - The pre-signed URL embeds a short-lived signature (`X-Amz-Signature`).
> - Browsers can render the image directly with `HTTP 200 OK`.
> - If an unauthorized third party accesses the raw S3 link without the signature, AWS returns `403 Forbidden`.

---

### Q3: Why is Next.js configured with `output: 'export'` for this deployment?
> **Answer**:
> `output: 'export'` compiles the Next.js application into pure static HTML, JavaScript, and CSS bundles (`client/out/`).
> - It eliminates the need for a dedicated Node.js server just to render frontend pages.
> - Client-side state and navigation are handled via Next.js App Router and React Context.
> - Combined with CloudFront custom error response routing (`403/404 -> /index.html`), it acts as a high-performance Single Page Application (SPA).

---

### Q4: How does AWS CloudFront Origin Access Control (OAC) work, and why is it superior to OAI (Origin Access Identity)?
> **Answer**:
> - **OAC** is AWS's modern method to secure S3 origins behind CloudFront.
> - Unlike legacy OAI, OAC supports **AWS Signature Version 4 (SigV4)**, SSE-KMS encryption, all AWS regions, and fine-grained IAM bucket policies using the `AWS:SourceArn` condition to ensure only the specific CloudFront distribution can access S3 objects.

---

### Q5: How do you prevent database connection starvation when scaling backend instances with PostgreSQL?
> **Answer**:
> PostgreSQL uses process-based connection models where each connection consumes ~10MB of memory.
> - We integrated **Supabase PgBouncer connection pooling** (`port 6543`) with `pgbouncer=true`.
> - Prisma routes query traffic through the transaction pooler for fast connection re-use and releases connections immediately after each query.
> - For schema migrations and table pushes, we use the `DIRECT_URL` on port 5432 to bypass pooler limitations on session-level DDL commands.

---

### Q6: How does the Bill Reminder background worker operate without blocking the main event loop?
> **Answer**:
> The bill reminder engine runs as an asynchronous worker:
> 1. It executes every 24 hours on a background interval and triggers on-demand whenever a new recurring bill is created or updated.
> 2. It queries unpaid bills with due dates matching target reminder thresholds (1, 3, and 7 days).
> 3. It utilizes non-blocking `Promise.all` with Nodemailer SMTP to dispatch reminder emails asynchronously without halting the Express request-response loop.

---

### Q7: What happens if the EC2 backend process crashes unexpectedly?
> **Answer**:
> We manage the backend with **PM2**:
> - PM2 acts as a process supervisor that monitors the Node.js event loop.
> - If an unhandled exception or memory leak occurs, PM2 restarts the process in <100ms.
> - `pm2 startup` and `pm2 save` ensure that if the EC2 instance is rebooted or patched, systemd restarts the backend automatically.

---

### 👨‍💻 Author & Architecture Credits
- **Project**: FinFlow — Modern Wealth Management Platform
- **Engineer**: Ananya Raj
- **Stack**: Next.js 16 • React 19 • Node.js • Express • Prisma • PostgreSQL (Supabase) • AWS (S3, CloudFront, EC2) • Terraform
