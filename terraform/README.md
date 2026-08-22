# FinFlow Terraform Infrastructure

This directory contains Terraform configurations for managing FinFlow's AWS infrastructure.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Importing Existing Resources](#importing-existing-resources)
- [Usage](#usage)
- [GitHub Actions Integration](#github-actions-integration)
- [Best Practices](#best-practices)

---

## 🎯 Overview

### What This Manages

- ✅ **S3 Bucket** - File uploads storage (avatars, receipts)
- ✅ **S3 Encryption** - AES256 server-side encryption
- ✅ **S3 Versioning** - Object versioning for recovery
- ✅ **S3 CORS** - Cross-origin resource sharing
- ✅ **S3 Public Access Block** - Prevent public access
- ✅ **S3 Lifecycle Rules** - Optional automated cleanup
- ✅ **IAM Policy** - Least-privilege S3 access
- ✅ **GitHub OIDC** - (Future) Secure CI/CD without keys

### What's NOT Managed Yet

- Database (Supabase PostgreSQL - managed externally)
- Compute resources (running locally/Docker for now)
- Networking (VPC, subnets - future addition)

---

## 🔧 Prerequisites

### 1. Install Terraform

```bash
# macOS
brew install terraform

# Windows (Chocolatey)
choco install terraform

# Linux (Ubuntu/Debian)
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform
```

Verify installation:
```bash
terraform version
```

### 2. Configure AWS Credentials

⚠️ **DO NOT use long-lived access keys in CI/CD!**

**For Local Development:**

Option A: AWS CLI (Recommended)
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Default region: ap-south-1
# Default output format: json
```

Option B: Environment Variables
```bash
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION="ap-south-1"
```

Option C: AWS SSO (Best for production)
```bash
aws sso login --profile finflow
export AWS_PROFILE=finflow
```

---

## 🚀 Initial Setup

### Step 1: Copy Variables File

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your actual values:
```hcl
s3_bucket_name = "finflow-uploads-ananya-2026"
aws_region     = "ap-south-1"
# ... update other values as needed
```

### Step 2: Initialize Terraform

```bash
terraform init
```

This will:
- Download AWS provider plugins
- Set up the Terraform working directory
- Prepare for state management

**Expected output:**
```
Terraform has been successfully initialized!
```

### Step 3: Format Code

```bash
terraform fmt
```

Ensures consistent formatting across all `.tf` files.

### Step 4: Validate Configuration

```bash
terraform validate
```

Checks for syntax errors and configuration issues.

**Expected output:**
```
Success! The configuration is valid.
```

---

## 📥 Importing Existing Resources

⚠️ **IMPORTANT**: Your S3 bucket and IAM user already exist. You must import them before applying changes.

### Import S3 Bucket

```bash
terraform import aws_s3_bucket.uploads finflow-uploads-ananya-2026
```

### Import S3 Bucket Configurations

```bash
# Import versioning
terraform import aws_s3_bucket_versioning.uploads finflow-uploads-ananya-2026

# Import encryption
terraform import aws_s3_bucket_server_side_encryption_configuration.uploads finflow-uploads-ananya-2026

# Import public access block
terraform import aws_s3_bucket_public_access_block.uploads finflow-uploads-ananya-2026

# Import CORS configuration
terraform import aws_s3_bucket_cors_configuration.uploads finflow-uploads-ananya-2026
```

### Import IAM Resources (if user exists)

If you want to manage your existing IAM user:

```bash
# First, find your IAM user name
aws iam list-users

# Import the user (only if create_iam_user = true in tfvars)
terraform import aws_iam_user.finflow_app[0] finflow-app-user
```

### Verify Imports

```bash
terraform plan
```

After importing, `terraform plan` should show:
- **No changes** if everything matches
- **Minor changes** for missing configurations (e.g., tags)
- **NO deletions** - if it wants to delete resources, STOP and investigate

---

## 🎯 Usage

### Plan Changes (Dry Run)

```bash
terraform plan
```

Review the proposed changes carefully. Look for:
- ✅ Green `+` = Resources to create
- ✅ Yellow `~` = Resources to modify
- ❌ Red `-` = Resources to DELETE (investigate before proceeding!)

### Apply Changes

```bash
terraform apply
```

Terraform will:
1. Show you the plan
2. Ask for confirmation (`yes`)
3. Apply changes
4. Show outputs

**To auto-approve (use with caution):**
```bash
terraform apply -auto-approve
```

### View Current State

```bash
terraform show
```

### View Outputs

```bash
terraform output
```

### Destroy Resources (⚠️ DANGEROUS)

```bash
terraform destroy
```

⚠️ **DO NOT RUN THIS** unless you want to delete all managed resources!

The S3 bucket has `prevent_destroy = true` to protect against accidental deletion.

---

## 🔄 GitHub Actions Integration

### Current Setup

Your GitHub Actions currently use `GITHUB_TOKEN` for Docker registry access, which is perfect. AWS credentials are not stored in GitHub Secrets.

### Option 1: Keep Current Approach (Recommended for now)

Continue using AWS credentials configured locally. Terraform changes are applied manually from your development machine.

**Workflow:**
1. Make infrastructure changes locally
2. Run `terraform plan` and `terraform apply`
3. Commit Terraform code (not state) to Git
4. Application deployment continues via GitHub Actions

### Option 2: GitHub OIDC (Future Enhancement)

Replace long-lived AWS access keys with temporary credentials via OpenID Connect.

**Setup:**

1. Enable OIDC in `terraform.tfvars`:
```hcl
enable_github_oidc = true
github_org         = "AnanyaRaj14"
github_repo        = "finflow"
```

2. Apply changes:
```bash
terraform apply
```

3. Update GitHub workflow to use OIDC:

```yaml
# .github/workflows/deploy.yml
jobs:
  deploy:
    permissions:
      id-token: write
      contents: read
    
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ap-south-1
      
      # Now you can use AWS CLI/SDK without access keys!
```

4. Add GitHub Secret:
```
AWS_ROLE_ARN = <output from terraform output github_actions_role_arn>
```

**Benefits:**
- ✅ No long-lived credentials
- ✅ Temporary tokens (1 hour)
- ✅ Automatic rotation
- ✅ Better security

---

## 📚 Best Practices

### 1. Never Commit Secrets

Files that should NEVER be committed:
- `terraform.tfvars` (contains your config)
- `terraform.tfstate` (contains resource details)
- `.terraform/` directory

These are already in `.gitignore`.

### 2. Use Remote State (Production)

For team collaboration, use remote state:

**Create S3 bucket for state:**
```bash
aws s3 mb s3://finflow-terraform-state --region ap-south-1
```

**Create DynamoDB table for locking:**
```bash
aws dynamodb create-table \
  --table-name finflow-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1
```

**Update `versions.tf`:**
```hcl
terraform {
  backend "s3" {
    bucket         = "finflow-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "ap-south-1"
    encrypt        = true
    dynamodb_table = "finflow-terraform-locks"
  }
}
```

**Re-initialize:**
```bash
terraform init -migrate-state
```

### 3. Use Workspaces for Environments

```bash
# Create dev workspace
terraform workspace new dev

# Switch to prod
terraform workspace select prod

# List workspaces
terraform workspace list
```

### 4. Regular State Refresh

```bash
terraform refresh
```

Updates state with real-world resources.

### 5. Plan Before Apply

**Always** run `terraform plan` before `terraform apply` to review changes.

---

## 🛠️ Common Commands

```bash
# Initialize (first time or after adding providers)
terraform init

# Format code
terraform fmt -recursive

# Validate configuration
terraform validate

# Plan changes
terraform plan

# Apply changes
terraform apply

# Show current state
terraform show

# List resources in state
terraform state list

# View specific resource
terraform state show aws_s3_bucket.uploads

# View outputs
terraform output

# Refresh state
terraform refresh

# Destroy everything (⚠️ DANGEROUS)
terraform destroy
```

---

## 🐛 Troubleshooting

### Issue: "Resource already exists"

**Solution**: Import the existing resource first.

```bash
terraform import aws_s3_bucket.uploads your-bucket-name
```

### Issue: "Access Denied"

**Solution**: Check AWS credentials are configured correctly.

```bash
aws sts get-caller-identity
```

### Issue: State Lock Error

**Solution**: If DynamoDB locking is enabled and a lock persists:

```bash
terraform force-unlock <LOCK_ID>
```

### Issue: Plan Shows Unwanted Changes

**Solution**: 
1. Review the change carefully
2. Update `terraform.tfvars` to match current config
3. Or update AWS resource to match desired state

---

## 📊 Resource Structure

```
terraform/
├── versions.tf              # Terraform & provider versions
├── provider.tf              # AWS provider configuration
├── variables.tf             # Input variable definitions
├── terraform.tfvars         # Variable values (gitignored)
├── terraform.tfvars.example # Example values (committed)
├── s3.tf                    # S3 bucket & configurations
├── iam.tf                   # IAM users, policies, roles
├── outputs.tf               # Output values
└── README.md                # This file
```

---

## 🚀 Next Steps

1. ✅ Complete initial setup (Steps 1-4)
2. ✅ Import existing resources
3. ✅ Run `terraform plan` to verify
4. ✅ Run `terraform apply` to manage infrastructure
5. 🔄 Consider setting up remote state for team collaboration
6. 🔄 Consider enabling GitHub OIDC for secure CI/CD

---

## 📞 Need Help?

- Terraform Docs: https://www.terraform.io/docs
- AWS Provider: https://registry.terraform.io/providers/hashicorp/aws/latest/docs
- GitHub OIDC: https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services

---

**Your infrastructure is now code! 🎉**
