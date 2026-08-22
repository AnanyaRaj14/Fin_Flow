# 🚀 CI/CD Guide - GitHub Actions

Complete guide for FinFlow's Continuous Integration and Continuous Deployment setup.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Workflows](#workflows)
3. [Setup Instructions](#setup-instructions)
4. [Secrets Configuration](#secrets-configuration)
5. [Deployment Options](#deployment-options)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### What We've Set Up

Your FinFlow project now has a complete CI/CD pipeline with:

✅ **Automated Testing** - Runs tests on every push/PR
✅ **Code Quality Checks** - Linting, security audits
✅ **Docker Image Building** - Multi-platform images
✅ **Security Scanning** - Vulnerability detection
✅ **Automated Releases** - Version tagging and changelogs
✅ **Dependency Updates** - Automated via Dependabot
✅ **PR Previews** - Build previews for pull requests

---

## 📁 Workflows Created

### 1. **`ci-cd.yml`** - Main CI/CD Pipeline

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs:**
- ✅ **test-server** - Tests server with PostgreSQL
- ✅ **test-client** - Tests and builds Next.js client
- ✅ **build-docker** - Builds and pushes Docker images
- ✅ **security-scan** - Scans for vulnerabilities
- ✅ **deploy** - Deploys to production (configurable)

**What it does:**
```
Push/PR
  ↓
Run Tests (Server + Client in parallel)
  ↓
Build Docker Images (only on main)
  ↓
Security Scan
  ↓
Deploy to Production (only on main)
```

---

### 2. **`docker-build.yml`** - Docker Image Builder

**Triggers:**
- Push to `main` branch
- Version tags (`v*.*.*`)
- Manual trigger

**What it does:**
- Builds server and client Docker images
- Pushes to GitHub Container Registry (ghcr.io)
- Creates multi-platform images (amd64, arm64)
- Scans images for vulnerabilities
- Caches layers for faster builds

**Image naming:**
```
ghcr.io/ananyaraj14/finflow/server:latest
ghcr.io/ananyaraj14/finflow/server:main
ghcr.io/ananyaraj14/finflow/server:sha-abc123

ghcr.io/ananyaraj14/finflow/client:latest
ghcr.io/ananyaraj14/finflow/client:main
ghcr.io/ananyaraj14/finflow/client:sha-abc123
```

---

### 3. **`code-quality.yml`** - Code Quality Checks

**Triggers:**
- Every push and PR

**What it does:**
- Runs ESLint on both server and client
- Performs security audit (`npm audit`)
- Checks for outdated dependencies

---

### 4. **`pr-preview.yml`** - Pull Request Previews

**Triggers:**
- Pull request opened/updated

**What it does:**
- Builds server and client
- Comments on PR with build status
- Can be extended to deploy preview environments

---

### 5. **`release.yml`** - Automated Releases

**Triggers:**
- Version tags pushed (e.g., `v1.0.0`)

**What it does:**
- Generates changelog from commits
- Creates GitHub release
- Builds and attaches artifacts
- Tags Docker images with version

---

### 6. **`dependabot.yml`** - Dependency Management

**What it does:**
- Weekly checks for dependency updates
- Creates PRs for npm, Docker, and GitHub Actions updates
- Automatically labels and assigns reviewers

---

## 🔧 Setup Instructions

### Step 1: Enable GitHub Actions

1. Go to your repository on GitHub
2. Click **Settings** → **Actions** → **General**
3. Under "Actions permissions":
   - Select **"Allow all actions and reusable workflows"**
4. Click **Save**

---

### Step 2: Enable GitHub Container Registry

1. Go to **Settings** → **Packages**
2. Under "Package creation":
   - Select **"Public"** or **"Private"** (your choice)
3. This allows workflows to push Docker images

---

### Step 3: Configure Secrets

Go to **Settings** → **Secrets and variables** → **Actions**

#### Required Secrets (for basic CI/CD):

**None!** The basic workflows use `GITHUB_TOKEN` which is automatically provided.

#### Optional Secrets (for deployment):

**For AWS Deployment:**
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
```

**For VPS Deployment:**
```
VPS_HOST - Your server IP
VPS_USERNAME - SSH username
VPS_SSH_KEY - Private SSH key
```

**For Vercel:**
```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

**For Production URLs:**
```
NEXT_PUBLIC_API_URL - Production API URL
```

---

### Step 4: Update Dependabot Reviewer

Edit `.github/dependabot.yml`:

```yaml
reviewers:
  - "AnanyaRaj14"  # ← Replace with your GitHub username
```

---

### Step 5: Configure Deployment (Optional)

Edit `.github/workflows/ci-cd.yml` and uncomment your deployment method:

**Option A: AWS ECS**
```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: us-east-1

- name: Deploy to ECS
  run: |
    aws ecs update-service --cluster finflow --service finflow-server --force-new-deployment
```

**Option B: Docker Compose on VPS**
```yaml
- name: Deploy to VPS
  uses: appleboy/ssh-action@v1.0.0
  with:
    host: ${{ secrets.VPS_HOST }}
    username: ${{ secrets.VPS_USERNAME }}
    key: ${{ secrets.VPS_SSH_KEY }}
    script: |
      cd /opt/finflow
      docker compose pull
      docker compose up -d
```

**Option C: Vercel (Client only)**
```yaml
- name: Deploy to Vercel
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 🔐 Secrets Configuration

### How to Add Secrets

1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Enter name and value
4. Click **"Add secret"**

### Required Secrets by Deployment Type

| Deployment | Secrets Needed |
|------------|----------------|
| **None (CI only)** | ❌ None |
| **AWS ECS** | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` |
| **VPS** | `VPS_HOST`, `VPS_USERNAME`, `VPS_SSH_KEY` |
| **Vercel** | `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` |

---

## 🚀 Deployment Options

### Option 1: GitHub Container Registry → VPS (Recommended)

**Architecture:**
```
GitHub Actions
    ↓
Build Docker Images
    ↓
Push to ghcr.io
    ↓
SSH to VPS
    ↓
Pull images & restart
```

**Setup:**

1. **On your VPS:**
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Create project directory
mkdir -p /opt/finflow
cd /opt/finflow
```

2. **Create docker-compose.yml on VPS:**
```yaml
services:
  server:
    image: ghcr.io/ananyaraj14/finflow/server:latest
    # ... rest of config

  client:
    image: ghcr.io/ananyaraj14/finflow/client:latest
    # ... rest of config
```

3. **Add SSH key to GitHub Secrets:**
```bash
# On your local machine
cat ~/.ssh/id_rsa  # Copy this
```

Add as `VPS_SSH_KEY` secret in GitHub.

4. **Uncomment VPS deployment in `ci-cd.yml`**

---

### Option 2: AWS ECS

**Setup:**

1. **Create ECS Cluster:**
```bash
aws ecs create-cluster --cluster-name finflow
```

2. **Create Task Definitions** for server and client

3. **Create Services:**
```bash
aws ecs create-service \
  --cluster finflow \
  --service-name finflow-server \
  --task-definition finflow-server:1 \
  --desired-count 1
```

4. **Add AWS credentials to GitHub Secrets**

5. **Uncomment AWS deployment in `ci-cd.yml`**

---

### Option 3: Vercel (Client) + Railway/Render (Server)

**Client on Vercel:**
1. Connect GitHub repo to Vercel
2. OR use GitHub Action (uncomment in `ci-cd.yml`)

**Server on Railway:**
1. Connect GitHub repo to Railway
2. Railway auto-deploys on push

---

## 📊 Workflow Triggers

### Automatic Triggers

| Event | Workflows Triggered |
|-------|-------------------|
| **Push to `main`** | ci-cd, code-quality, docker-build |
| **Push to `develop`** | ci-cd, code-quality |
| **Pull Request** | ci-cd, code-quality, pr-preview |
| **Tag `v*.*.*`** | docker-build, release |
| **Weekly** | dependabot checks |

### Manual Triggers

You can manually run workflows:

1. Go to **Actions** tab
2. Select workflow (e.g., "Docker Build & Push")
3. Click **"Run workflow"**
4. Select branch
5. Click **"Run workflow"** button

---

## 🎯 Best Practices

### 1. **Branch Protection Rules**

Set up branch protection for `main`:

1. Go to **Settings** → **Branches**
2. Add rule for `main`
3. Enable:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date

---

### 2. **Semantic Versioning**

Use semantic versioning for releases:

```bash
# Bug fix (1.0.0 → 1.0.1)
git tag v1.0.1
git push origin v1.0.1

# New feature (1.0.0 → 1.1.0)
git tag v1.1.0
git push origin v1.1.0

# Breaking change (1.0.0 → 2.0.0)
git tag v2.0.0
git push origin v2.0.0
```

This triggers the release workflow automatically.

---

### 3. **Commit Message Convention**

Use conventional commits for automatic changelogs:

```bash
feat: add user authentication
fix: resolve login bug
chore: update dependencies
docs: improve README
```

Labels in release notes:
- `feat:` → 🚀 Features
- `fix:` → 🐛 Bug Fixes
- `chore:` → 🔧 Maintenance
- `docs:` → 📚 Documentation

---

### 4. **Environment-Specific Configs**

Create environment files:

```
.env.development  # Local development
.env.staging      # Staging environment
.env.production   # Production environment
```

Never commit these to Git!

---

## 🧪 Testing the CI/CD

### Test 1: Push to Main

```bash
git checkout main
echo "# Test" >> README.md
git add README.md
git commit -m "test: verify CI/CD pipeline"
git push origin main
```

**Expected:** All workflows run, Docker images built and pushed.

---

### Test 2: Create Pull Request

```bash
git checkout -b feature/test
echo "# Feature" >> test.md
git add test.md
git commit -m "feat: add test feature"
git push origin feature/test
```

Create PR on GitHub.

**Expected:** Tests run, PR comment added with build status.

---

### Test 3: Create Release

```bash
git checkout main
git tag v1.0.0
git push origin v1.0.0
```

**Expected:** Release created with changelog and artifacts.

---

## 🐛 Troubleshooting

### Issue: "Permission denied" in Docker build

**Solution:** Make sure GitHub Container Registry is enabled:
1. Settings → Packages → Enable package creation

---

### Issue: "Resource not accessible by integration"

**Solution:** Update workflow permissions:

```yaml
permissions:
  contents: read
  packages: write
  security-events: write
```

---

### Issue: Tests fail with "Database connection"

**Solution:** The workflow uses a PostgreSQL service container. If tests fail:

1. Check `DATABASE_URL` in workflow
2. Ensure migrations run before tests
3. Verify Prisma schema is correct

---

### Issue: Docker build timeout

**Solution:** Increase timeout or use caching:

```yaml
- name: Build
  timeout-minutes: 30  # Increase from default 360
```

---

### Issue: Secrets not working

**Solution:**
1. Verify secret names match exactly (case-sensitive)
2. Secrets are scoped to repository - check you're in the right repo
3. Re-save the secret (sometimes helps)

---

## 📈 Monitoring

### View Workflow Runs

1. Go to **Actions** tab in your repo
2. See all workflow runs
3. Click on a run to see details
4. Click on a job to see logs

### Workflow Status Badge

Add to your README.md:

```markdown
![CI/CD](https://github.com/AnanyaRaj14/finflow/actions/workflows/ci-cd.yml/badge.svg)
```

---

## 🔄 Workflow Maintenance

### Update Node.js Version

Edit workflows and change:

```yaml
env:
  NODE_VERSION: '22'  # Update this
```

### Update Docker Base Images

Edit Dockerfiles:

```dockerfile
FROM node:22-alpine  # Update version
```

### Add New Tests

Add test scripts to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:e2e": "playwright test"
  }
}
```

Workflows will automatically run them.

---

## 📚 Additional Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Dependabot](https://docs.github.com/en/code-security/dependabot)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

---

## ✅ Checklist

Before pushing to main:

- [ ] All workflows created
- [ ] GitHub Actions enabled
- [ ] Container Registry enabled
- [ ] Secrets configured (if deploying)
- [ ] Branch protection rules set
- [ ] Dependabot reviewer updated
- [ ] Test workflows by pushing to develop
- [ ] Review and customize deployment section

---

**Your CI/CD pipeline is ready!** 🎉

Push your code and watch the magic happen!
