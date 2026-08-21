provider "aws" {
  region = var.aws_region

  # AWS credentials should be configured via:
  # 1. AWS CLI: aws configure
  # 2. Environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
  # 3. IAM roles (recommended for production)
  # 4. AWS SSO
  #
  # DO NOT hardcode credentials here!

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
      Application = "FinFlow"
    }
  }
}
