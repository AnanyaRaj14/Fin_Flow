# ──────────────────────────────────────────────────────────
# Terraform Outputs
# ──────────────────────────────────────────────────────────

# CloudFront distribution URL (Live web application domain)
output "cloudfront_domain_name" {
  description = "CloudFront live website URL"
  value       = "https://${aws_cloudfront_distribution.cdn.domain_name}"
}

# CloudFront distribution ID (used for CI/CD cache invalidation)
output "cloudfront_distribution_id" {
  description = "CloudFront Distribution ID"
  value       = aws_cloudfront_distribution.cdn.id
}

# Public IP address of the EC2 backend instance
output "ec2_public_ip" {
  description = "Public IP address of the EC2 backend instance"
  value       = aws_instance.backend.public_ip
}

# Frontend S3 bucket name (used for uploading Next.js static build files)
output "frontend_bucket_name" {
  description = "Frontend S3 bucket name"
  value       = aws_s3_bucket.frontend.id
}

# Uploads S3 bucket name (used for receipts and avatar storage)
output "uploads_bucket_name" {
  description = "Uploads S3 bucket name"
  value       = aws_s3_bucket.uploads.id
}
