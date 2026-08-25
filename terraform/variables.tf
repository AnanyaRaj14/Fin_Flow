# ──────────────────────────────────────────────────────────
# Variables Definition
# ──────────────────────────────────────────────────────────

# AWS Region where resources are deployed
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "ap-south-1"
}

# Project name used in tags and prefixes
variable "project_name" {
  description = "Project name"
  type        = string
  default     = "finflow"
}

# Deployment environment (dev, staging, prod)
variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

# S3 bucket for hosting frontend Next.js static build files
variable "frontend_bucket_name" {
  description = "Name of S3 bucket for frontend static files"
  type        = string
}

# S3 bucket for storing user receipts and avatars
variable "uploads_bucket_name" {
  description = "Name of S3 bucket for media uploads"
  type        = string
}

# EC2 instance type for running backend server
variable "instance_type" {
  description = "EC2 instance type for backend"
  type        = string
  default     = "t3.micro"
}

# Optional EC2 key pair name for SSH access
variable "key_name" {
  description = "AWS Key Pair name for SSH access (optional)"
  type        = string
  default     = ""
}
