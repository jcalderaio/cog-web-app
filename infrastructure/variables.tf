variable "route53_zone_ids" {
  type = "map"

  default = {
    dev   = "ZYR07GBUN2JZ4"
    qa    = "Z3VYKT310YO643"
    stage = "Z2D1GVP8AYUI1F"
  }
}