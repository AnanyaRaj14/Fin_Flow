# ──────────────────────────────────────────────────────────
# IAM User for FinFlow Application - EXISTING RESOURCE
# This user already exists and will be imported into Terraform state
# ──────────────────────────────────────────────────────────

resource "aws_iam_user" "finflow_app" {
  count = var.create_iam_user ? 1 : 0
  name  = var.iam_user_name
  path  = "/"

  tags = {
    Name        = var.iam_user_name
    Description = "FinFlow application S3 access user"
    Application = "FinFlow"
  }
}

# ──────────────────────────────────────────────────────────
# IAM Policy for S3 Access (Least Privilege)
# ──────────────────────────────────────────────────────────

resource "aws_iam_policy" "s3_access" {
  name        = "${var.project_name}-s3-access-policy"
  description = "Policy for FinFlow application to access S3 bucket"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ListBucket"
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetBucketLocation"
        ]
        Resource = aws_s3_bucket.uploads.arn
      },
      {
        Sid    = "ObjectAccess"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:PutObjectAcl"
        ]
        Resource = "${aws_s3_bucket.uploads.arn}/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-server-side-encryption" = "AES256"
          }
        }
      },
      {
        Sid    = "AllowEncryptedUploads"
        Effect = "Allow"
        Action = [
          "s3:PutObject"
        ]
        Resource = "${aws_s3_bucket.uploads.arn}/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-server-side-encryption" = "AES256"
          }
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-s3-access-policy"
  }
}

# ──────────────────────────────────────────────────────────
# Attach Policy to User
# ──────────────────────────────────────────────────────────

resource "aws_iam_user_policy_attachment" "finflow_app_s3" {
  count      = var.create_iam_user ? 1 : 0
  user       = aws_iam_user.finflow_app[0].name
  policy_arn = aws_iam_policy.s3_access.arn
}

# ──────────────────────────────────────────────────────────
# GitHub OIDC Provider (Future: Replace IAM User Keys)
# ──────────────────────────────────────────────────────────

# GitHub OIDC provider for secure CI/CD without long-lived credentials
resource "aws_iam_openid_connect_provider" "github" {
  count = var.enable_github_oidc ? 1 : 0

  url = "https://token.actions.githubusercontent.com"

  client_id_list = [
    "sts.amazonaws.com"
  ]

  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd"
  ]

  tags = {
    Name = "${var.project_name}-github-oidc"
  }
}

# IAM Role for GitHub Actions (when OIDC is enabled)
resource "aws_iam_role" "github_actions" {
  count = var.enable_github_oidc ? 1 : 0
  name  = "${var.project_name}-github-actions-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github[0].arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            "token.actions.githubusercontent.com:sub" = "repo:${var.github_org}/${var.github_repo}:*"
          }
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-github-actions-role"
  }
}

# Attach S3 policy to GitHub Actions role
resource "aws_iam_role_policy_attachment" "github_actions_s3" {
  count      = var.enable_github_oidc ? 1 : 0
  role       = aws_iam_role.github_actions[0].name
  policy_arn = aws_iam_policy.s3_access.arn
}

# ──────────────────────────────────────────────────────────
# Data source for existing IAM user (when not creating new)
# COMMENTED OUT - Using admin credentials instead
# ──────────────────────────────────────────────────────────

# data "aws_iam_user" "existing" {
#   count     = var.create_iam_user ? 0 : 1
#   user_name = var.iam_user_name
# }
