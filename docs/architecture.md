# Architecture

The repository keeps one small service and changes the delivery path around it. That keeps the infrastructure easy to inspect without burying it under application code.

```text
                  GitHub Actions
                       |
                 build / scan
                       |
               container registry
                       |
        +--------------+--------------+
        |                             |
   legacy VM                       Kubernetes
 Ansible + Nginx                 Helm + Argo CD
        |                             |
        +------------- users --------+

Local observability: Prometheus -> Grafana
                     container logs -> Alloy -> Loki -> Grafana

AWS target: Terraform -> VPC + ECR + EKS managed node group
```

## Deployment paths

The VM deployment under `ansible/` is kept as a valid source environment for the migration. It provides the workload to move from and remains available as the rollback target during cutover.

The Kubernetes target is packaged with Helm. Argo CD points at the chart and reconciles it into a cluster after the image has been published.

## CI/CD split

GitHub Actions is the primary pipeline. It checks the service, builds and smoke-tests the image, scans the image and infrastructure configuration with Trivy, lints the Helm chart, validates Terraform, and syntax-checks the Ansible playbook.

The Jenkinsfile remains as the legacy CI path so the repository contains both sides of the Jenkins-to-GitHub-Actions migration.

## Observability

The application exposes Prometheus metrics at `/metrics` and writes JSON access logs to stdout. Local Docker Compose wiring sends metrics to Prometheus and container logs to Loki through Grafana Alloy. Grafana is provisioned with both data sources.
