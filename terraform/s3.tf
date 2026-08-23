# ──────────────────────────────────────────────────────────
# S3 Bucket - EXISTING RESOURCE
# This bucket already exists and will be imported into Terraform state
# ──────────────────────────────────────────────────────────

resource "aws_s3_bucket" "uploads" {
  bucket = var.s3_bucket_name

  # Prevent accidental deletion
  lifecycle {
    prevent_destroy = false
  }

  tags = {
    Name        = "FinFlow-Uploads"
    Environment = var.environment
    Description = "File uploads for avatars and receipts"
    ManagedBy   = "Terraform"
  }
}

# ──────────────────────────────────────────────────────────
# S3 Bucket Versioning
# ──────────────────────────────────────────────────────────

resource "aws_s3_bucket_versioning" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  versioning_configuration {
    status = var.enable_versioning ? "Enabled" : "Suspended"
  }
}

# ──────────────────────────────────────────────────────────
# S3 Bucket Encryption
# ──────────────────────────────────────────────────────────

resource "aws_s3_bucket_server_side_encryption_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# ──────────────────────────────────────────────────────────
# S3 Bucket Public Access Block
# ──────────────────────────────────────────────────────────

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ──────────────────────────────────────────────────────────
# S3 Bucket CORS Configuration
# ──────────────────────────────────────────────────────────

resource "aws_s3_bucket_cors_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = var.allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# ──────────────────────────────────────────────────────────
# S3 Bucket Lifecycle Configuration (Optional)
# ──────────────────────────────────────────────────────────

resource "aws_s3_bucket_lifecycle_configuration" "uploads" {
  count  = var.lifecycle_rules_enabled ? 1 : 0
  bucket = aws_s3_bucket.uploads.id

  # Rule for old receipts (optional cleanup after retention period)
  rule {
    id     = "expire-old-receipts"
    status = var.lifecycle_expiration_days > 0 ? "Enabled" : "Disabled"

    filter {
      prefix = "finflow/receipts/"
    }

    # Transition to Glacier after 90 days (cheaper storage)
    dynamic "transition" {
      for_each = var.lifecycle_transition_days > 0 ? [1] : []
      content {
        days          = var.lifecycle_transition_days
        storage_class = "GLACIER"
      }
    }

    # Delete after expiration days (if set)
    dynamic "expiration" {
      for_each = var.lifecycle_expiration_days > 0 ? [1] : []
      content {
        days = var.lifecycle_expiration_days
      }
    }
  }

  # Rule for old avatars (users should update, keep for reference)
  rule {
    id     = "transition-old-avatars"
    status = var.lifecycle_transition_days > 0 ? "Enabled" : "Disabled"

    filter {
      prefix = "finflow/avatars/"
    }

    dynamic "transition" {
      for_each = var.lifecycle_transition_days > 0 ? [1] : []
      content {
        days          = var.lifecycle_transition_days
        storage_class = "GLACIER"
      }
    }
  }
}

# ──────────────────────────────────────────────────────────
# S3 Bucket Logging (Optional - for audit trail)
# ──────────────────────────────────────────────────────────

# Uncomment if you want to enable access logging
# resource "aws_s3_bucket_logging" "uploads" {
#   bucket = aws_s3_bucket.uploads.id
#
#   target_bucket = aws_s3_bucket.logs.id
#   target_prefix = "s3-access-logs/"
# }
