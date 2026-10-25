terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket  = "finflow-terraform-state-838885265032"
    key     = "prod/terraform.tfstate"
    region  = "ap-south-1"
    encrypt = true
  }
}
