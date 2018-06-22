data "aws_acm_certificate" "cert" {
  domain   = "cognosante.cc"
  statuses = ["ISSUED"]
}

resource "aws_cloudfront_distribution" "hie_insight_distribution" {
  origin {
    domain_name = "cgs-esante-web-res.s3.amazonaws.com"
    origin_id   = "hie-insight-${terraform.env}"
    origin_path = "/insight/${terraform.env}"
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "HIE Insight Web - ${terraform.env}"
  default_root_object = "index.html"

  logging_config {
    include_cookies = false
    bucket          = "cgs-logs.s3.amazonaws.com"
    prefix          = "hie-insight"
  }

  aliases = ["insight.${terraform.env}.cognosante.cc"]

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "hie-insight-${terraform.env}"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 900
  }

  price_class = "PriceClass_100"

 restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }


  tags {
    Name = "hie-insight-${terraform.env}"
    Environment = "${terraform.env}"
  }

  viewer_certificate {
    acm_certificate_arn = "${data.aws_acm_certificate.cert.arn}"
    ssl_support_method = "sni-only"
    minimum_protocol_version = "TLSv1"
  }
}

resource "aws_route53_record" "app" {
  zone_id = "${lookup(var.route53_zone_ids, terraform.env)}"
  name    = "insight.${terraform.env}.cognosante.cc"
  type    = "A"

  alias {
    name                   = "${aws_cloudfront_distribution.hie_insight_distribution.domain_name}"
    zone_id                = "${aws_cloudfront_distribution.hie_insight_distribution.hosted_zone_id}"
    evaluate_target_health = false
  }
}
