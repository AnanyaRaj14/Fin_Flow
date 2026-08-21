terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Optional: Configure remote backend for state management
  # Uncomment and configure when ready for team collaboration
  # backend "s3" {
  #   bucket         = "finflow-terraform-state"
  #   key            = "prod/terraform.tfstate"
  #   region         = "ap-south-1"
  #   encrypt        = true
  #   dynamodb_table = "finflow-terraform-locks"
  # }
}
