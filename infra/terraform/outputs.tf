output "cluster_name" {
  value = module.eks.cluster_name
}

output "ecr_repository_url" {
  value = aws_ecr_repository.app.repository_url
}

output "vpc_id" {
  value = module.vpc.vpc_id
}

output "kubectl_config_command" {
  value = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}
