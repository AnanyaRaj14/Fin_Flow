# ──────────────────────────────────────────────────────────
# General Variables
# ──────────────────────────────────────────────────────────

variable "project_name" {
  description = "Project name used for resource naming and tagging"
  type        = string
  default     = "finflow"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "prod"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "ap-south-1"
}

# ──────────────────────────────────────────────────────────
# S3 Variables
# ──────────────────────────────────────────────────────────

variable "s3_bucket_name" {
  description = "Name of the existing S3 bucket for file uploads"
  type        = string
  # This will be imported from existing bucket
}

variable "enable_versioning" {
  description = "Enable versioning for S3 bucket"
  type        = bool
  default     = true
}

variable "enable_encryption" {
  description = "Enable server-side encryption for S3 bucket"
  type        = bool
  default     = true
}

variable "lifecycle_rules_enabled" {
  description = "Enable lifecycle rules for old file cleanup"
  type        = bool
  default     = false
}

variable "lifecycle_transition_days" {
  description = "Days before transitioning objects to cheaper storage"
  type        = number
  default     = 90
}

variable "lifecycle_expiration_days" {
  description = "Days before expiring old objects (0 = disabled)"
  type        = number
  default     = 0
}

variable "allowed_origins" {
  description = "Allowed origins for CORS configuration"
  type        = list(string)
  default = [
    "http://localhost:3001",
    "http://localhost:3000"
  ]
}

# ──────────────────────────────────────────────────────────
# IAM Variables
# ──────────────────────────────────────────────────────────

variable "iam_user_name" {
  description = "Name of the IAM user for application access"
  type        = string
  default     = "finflow-app-user"
}

variable "create_iam_user" {
  description = "Whether to create a new IAM user (false = import existing)"
  type        = bool
  default     = false
}

# ──────────────────────────────────────────────────────────
# GitHub OIDC Variables (for future use)
# ──────────────────────────────────────────────────────────

variable "enable_github_oidc" {
  description = "Enable GitHub OIDC provider for CI/CD"
  type        = bool
  default     = false
}

variable "github_org" {
  description = "GitHub organization or username"
  type        = string
  default     = ""
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
  default     = ""
}
