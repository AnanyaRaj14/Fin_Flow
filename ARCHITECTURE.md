# FinFlow — Production Cloud Architecture & Deployment Guide

This document outlines the complete cloud-native architecture, deployment workflows, Infrastructure as Code (IaC), and CI/CD pipelines for **FinFlow**.

---

## 🏛️ Master System Architecture

```
========================================================================================
                                💻 DEVELOPER WORKFLOW
========================================================================================
     [ 🧑‍💻 Code Change ] ──► [ git push origin main ] ──► [ 🐙 GitHub Repository ]
                                                                 │
                                                                 ▼
========================================================================================
                          ⚙️ GITHUB ACTIONS CI/CD PIPELINE
========================================================================================
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │ (Frontend Job)                                │ (Backend Job)
                 ▼                                               ▼
     [ 1. npm run build ]                            [ 1. docker build ]
     (Static Export: client/out)                     (server/Dockerfile)
                 │                                               │
                 ▼                                               ▼
     [ 2. Sync to AWS S3 ]                           [ 2. Push to Amazon ECR ]
     (Frontend Static Bucket)                        (Container Registry)
                 │                                               │
                 ▼                                               ▼
     [ 3. Invalidate CloudFront ]                    [ 3. Trigger App Runner ]
     (Purge Edge Cache)                              (Redeploy Container)

========================================================================================
                             ☁️ AWS RUNTIME INFRASTRUCTURE
                     (Fully Provisioned via Terraform & Remote S3 State)
========================================================================================
                                         │
                                [ 👤 USER'S BROWSER ]
                                         │
                                         ▼
                             [ 🌐 CloudFront CDN ]
                     (https://yourdomain.com - Single Origin URL)
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   │                                           │
          (Traffic: /*)                               (Traffic: /api/*)
                   │                                           │
                   ▼                                           ▼
       [ 🪣 S3: Frontend Web ]                     [ 🚀 AWS App Runner ]
       - Static HTML/CSS/JS                        - Containerized Express API
       - Served via OAC (Private)                  - Runs migrations & API
                                                               │
                                  ┌────────────────────────────┼────────────────────────────┐
                                  │                            │                            │
                                  ▼                            ▼                            ▼
                       [ 🐘 PostgreSQL ]              [ 🪣 S3: Media ]              [ ✉️ AWS SES ]
                       (Neon / Supabase)              (Receipts & Avatars)          (Email Verification)
```

---

## 🧩 Architectural Components & Rationale

| Layer | Technology | Role & Why Chosen |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16 (Static Export) | Decoupled client-side SPA. Pre-rendered to static assets for sub-100ms global delivery. |
| **CDN & Routing** | AWS CloudFront | Global edge CDN. Routes `/*` to S3 and `/api/*` to App Runner under the same domain, eliminating CORS and third-party cookie blocking. |
| **Frontend Storage** | AWS S3 | Stores static HTML/CSS/JS. Secured with Origin Access Control (OAC) so the bucket is 100% private. |
| **Backend Compute** | AWS App Runner | Fully managed container runtime. Runs Node.js 24/7 with zero server/Nginx maintenance and supports in-memory bill reminder timers. |
| **Container Registry** | Amazon ECR | Stores versioned Docker images deployed by GitHub Actions. |
| **Database** | PostgreSQL (Neon / Supabase) | Serverless/Managed relational database connected via Prisma ORM with connection pooling and automated migrations. |
| **Media Storage** | AWS S3 (`multer-s3`) | Stores user receipts and profile avatars, replacing external services like Cloudinary. |
| **Email Service** | AWS SES / Resend | High-deliverability transactional emails for account verification and password resets. |
| **CI/CD** | GitHub Actions | Automated parallel pipelines for testing, Docker builds, S3 syncing, and CDN cache invalidations on push. |
| **IaC** | Terraform | Codifies all cloud infrastructure with remote state locking in S3 and DynamoDB. |

---

## 📋 15-Step Incremental Implementation Checklist

- [ ] **1. Database**: Provision PostgreSQL on **Neon.tech** or **Supabase** and copy `DATABASE_URL`.
- [ ] **2. Docker**: Write `server/Dockerfile` and `server/.dockerignore`.
- [ ] **3. Local Test**: Run `docker build` & `docker run -p 5000:5000` to verify the container locally.
- [ ] **4. AWS IAM**: Create an IAM User with S3/ECR/AppRunner/CloudFront permissions and download Access Keys.
- [ ] **5. Amazon ECR**: Create private repository `finflow-backend` and push your Docker image.
- [ ] **6. AWS App Runner**: Create an App Runner service from the ECR image on port 5000 with production env vars.
- [ ] **7. Next.js Config**: Add `output: 'export'` and `trailingSlash: true` in `client/next.config.mjs`.
- [ ] **8. Static Build**: Set `NEXT_PUBLIC_API_URL=/api` and run `npm run build` in `client/`.
- [ ] **9. AWS S3**: Create private S3 bucket `finflow-frontend-prod` and upload `client/out/` files.
- [ ] **10. CloudFront Origins**: Create a CDN distribution linking S3 (for `/*`) and App Runner (for `/api/*`).
- [ ] **11. CloudFront Routing**: Configure 403/404 custom error pages mapping to `/index.html` (HTTP 200).
- [ ] **12. GitHub Secrets**: Add `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `CLOUDFRONT_DIST_ID` to GitHub.
- [ ] **13. GitHub Actions**: Create `.github/workflows/deploy.yml` for automated Docker & S3 deployment on push.
- [ ] **14. Terraform (IaC)**: Write `terraform/` scripts with remote S3 state backend to codify infrastructure.
- [ ] **15. E2E Verification**: Push code to GitHub, verify CI/CD passes, and test full login/dashboard/upload flow on live URL.

---

## 🛠️ Configuration References

### 1. Backend Dockerfile (`server/Dockerfile`)
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Generate Prisma Client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code
COPY . .

EXPOSE 5000

# Run migrations at container startup, then launch Express
CMD ["sh", "-c", "npx prisma migrate deploy && node index.js"]
```

---

### 2. Frontend Next.js Config (`client/next.config.mjs`)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: 'https', hostname: '**.amazonaws.com' }],
  },
};

export default nextConfig;
```

---

### 3. GitHub Actions Pipeline (`.github/workflows/deploy.yml`)
```yaml
name: Production Deployment Pipeline

on:
  push:
    branches: [ main ]

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: finflow-backend
  S3_BUCKET: finflow-frontend-prod
  CLOUDFRONT_DIST_ID: ${{ secrets.CLOUDFRONT_DIST_ID }}

jobs:
  deploy-backend:
    name: Deploy Backend (Docker -> ECR -> App Runner)
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build, Tag, and Push Docker Image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: latest
        run: |
          cd server
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

  deploy-frontend:
    name: Deploy Frontend (Next.js -> S3 -> CloudFront)
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: 'client/package-lock.json'

      - name: Build Static Export
        env:
          NEXT_PUBLIC_API_URL: /api
        run: |
          cd client
          npm ci
          npm run build

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Sync to S3
        run: |
          aws s3 sync client/out s3://${{ env.S3_BUCKET }} --delete

      - name: Invalidate CloudFront Cache
        run: |
          aws cloudfront create-invalidation --distribution-id ${{ env.CLOUDFRONT_DIST_ID }} --paths "/*"
```

---

### 4. Terraform Core Setup (`terraform/main.tf`)
```hcl
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "finflow-terraform-state-bucket"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "finflow-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}
```

---

## 🔐 Environment Variables Reference

### Backend (`server/.env` / App Runner)
| Variable | Description |
| :--- | :--- |
| `NODE_ENV` | `production` (enables secure cookies and performance optimizations) |
| `PORT` | `5000` |
| `DATABASE_URL` | PostgreSQL connection string with SSL (`sslmode=require`) |
| `JWT_SECRET` | Secret key for signing authentication tokens |
| `JWT_EXPIRE` | Token expiration period (e.g. `7d`) |
| `CLIENT_URL` | Live CloudFront URL (e.g. `https://d12345.cloudfront.net` or custom domain) |
| `SMTP_HOST` | SMTP server host (e.g. `email-smtp.us-east-1.amazonaws.com`) |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password / API key |
| `FROM_EMAIL` | Verified sender address (e.g. `noreply@yourdomain.com`) |
| `AWS_MEDIA_BUCKET`| S3 bucket name for receipt and avatar uploads |

### Frontend (`client/.env.production`)
| Variable | Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `/api` | Relative path routed automatically to App Runner via CloudFront |

---

## 🛡️ Critical Security & Routing Policies

1. **First-Party Cookies & SameSite Policy**:
   - Because CloudFront proxies `/api/*` and `/*` under the exact same domain, cookies are treated as first-party.
   - `sameSite: 'lax'` and `secure: true` work seamlessly without third-party tracking blocks in Chrome and Safari.
2. **S3 Private Security**:
   - The S3 buckets block all direct public access (`block_public_acls = true`).
   - CloudFront authenticates with S3 via **Origin Access Control (OAC)** with AWS SigV4 request signing.
3. **Single Page Application (SPA) Routing**:
   - CloudFront maps HTTP 403 and 404 error responses to `/index.html` with response code 200, allowing Next.js client-side navigation without page refresh breakage.
