variable "aws_region" {
  description = "EC2 Region for the VPC"
  default     = "us-east-1"
}

provider "aws" {
  # access_key = "${var.aws_access_key}"
  # secret_key = "${var.aws_secret_key}"
  region = "${var.aws_region}"
}

terraform {
  backend "s3" {
    bucket = "cgs-terraform"
    key    = "esante/hie-insight.tfstate"
    region = "us-east-1"
  }
}
