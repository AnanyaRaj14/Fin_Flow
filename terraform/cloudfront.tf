# ──────────────────────────────────────────────────────────
# CloudFront CDN Distribution & Origin Access Control
# ──────────────────────────────────────────────────────────

# Origin Access Control (OAC) to allow CloudFront to securely access private frontend S3 bucket
resource "aws_cloudfront_origin_access_control" "frontend_oac" {
  name                              = "${var.project_name}-frontend-oac"
  description                       = "OAC for FinFlow frontend S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront distribution serving global traffic for frontend and routing API to EC2
resource "aws_cloudfront_distribution" "cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  comment             = "FinFlow CDN distribution"

  # 1. Frontend S3 Origin
  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "S3-Frontend"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend_oac.id
  }

  # 2. EC2 Backend API Origin
  origin {
    domain_name = aws_instance.backend.public_dns != "" ? aws_instance.backend.public_dns : aws_instance.backend.public_ip
    origin_id   = "EC2-Backend"

    custom_origin_config {
      http_port              = 5000
      https_port             = 443
      origin_protocol_policy = "http-only" # EC2 runs HTTP on port 5000
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Default cache behavior routing static website requests (/*) to Frontend S3
  default_cache_behavior {
    target_origin_id       = "S3-Frontend"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
  }

  # Ordered cache behavior routing API requests (/api/*) directly to EC2 Backend
  ordered_cache_behavior {
    path_pattern           = "/api/*"
    target_origin_id       = "EC2-Backend"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    compress               = true

    # Disable caching for live API endpoints & forward all headers/cookies
    forwarded_values {
      query_string = true
      headers      = ["*"]
      cookies {
        forward = "all"
      }
    }

    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }

  # Custom error response for 403 handling (Next.js SPA client-side routing)
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  # Custom error response for 404 handling (Next.js SPA client-side routing)
  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  # Global price class (use edge locations worldwide)
  price_class = "PriceClass_100" # Uses US, Canada, Europe, Asia locations (cost-effective)

  # Standard SSL certificate provided by CloudFront default domain
  viewer_certificate {
    cloudfront_default_certificate = true
  }

  # Geo restriction rules (allow all countries)
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Name        = "${var.project_name}-cdn"
    Environment = var.environment
  }
}
