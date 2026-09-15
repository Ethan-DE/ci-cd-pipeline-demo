# Status API Platform Migration

This project implements two delivery paths for the same service: an Ubuntu VM deployment managed with Ansible and Nginx, and a Kubernetes deployment on AWS EKS managed with Terraform, Helm and Argo CD.

The application is intentionally small so the focus stays on delivery, infrastructure, observability, security checks and migration work.

## What it covers

- Docker image with a non-root runtime and container health check
- GitHub Actions for tests, image smoke tests, Trivy scanning and configuration validation
- Jenkins pipeline retained as the legacy CI path
- Helm deployment with probes, rolling updates, disruption budget and optional HPA/Ingress
- Argo CD application for GitOps reconciliation
- Terraform for an AWS VPC, ECR repository and EKS managed node group
- Ansible deployment for the source VM environment
- Prometheus metrics, Grafana data sources, Loki logs and Grafana Alloy collection
- VM-to-EKS and Jenkins-to-GitHub-Actions migration runbooks

## Service endpoints

| Path | Use |
| --- | --- |
| `/` | service/version response |
| `/health` | liveness |
| `/ready` | readiness/draining state |
| `/metrics` | Prometheus metrics |

The service writes one JSON log line per request and handles SIGTERM so Kubernetes can drain it during a rollout.

## Run it locally

```bash
node app/server.js
```

In another terminal:

```bash
npm --prefix app test
./scripts/smoke.sh
```

Or with Docker:

```bash
docker compose up --build -d
./scripts/smoke.sh
```

## Add the local monitoring stack

```bash
docker compose --profile observability up --build -d
```

That starts Prometheus, Grafana, Loki and Alloy alongside the API. See `docs/operations.md` for ports and useful PromQL queries.

## Kubernetes

The Helm chart is under `helm/status-api`.

```bash
helm lint helm/status-api --set image.tag=local
helm upgrade --install status-api helm/status-api \
  --namespace status-api \
  --create-namespace \
  --set image.repository=your-registry/status-api \
  --set image.tag=your-tag
```

The ServiceMonitor and PrometheusRule are optional because they require the Prometheus Operator CRDs.

## AWS target

`infra/terraform` defines the AWS target used in the migration runbook: two-AZ VPC networking, an ECR repository and an EKS cluster with a managed node group.

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
terraform init -backend=false
terraform plan
```

The checked-in backend file documents the remote-state layout. EKS and NAT gateways cost money, so CI validates the configuration but does not apply billable resources automatically.

## Migration workflows

`docs/migration-vm-to-eks.md` covers moving the Ansible-managed VM deployment to EKS while keeping the VM available for rollback.

`docs/migration-jenkins-to-actions.md` maps the Jenkins stages to GitHub Actions and uses a dual-run period before Jenkins is disabled.

The endpoint comparison script is used during the parallel-run stage:

```bash
./scripts/compare-endpoints.sh https://old.example.com https://new.example.com
```

## Repository layout

```text
app/                  Node service and tests
ansible/              source VM deployment
argocd/               GitOps application definition
helm/                  Kubernetes package
infra/terraform/      AWS target infrastructure
observability/        Prometheus, Grafana, Loki and Alloy config
scripts/              smoke and migration checks
docs/                 architecture, operations and migration notes
.github/workflows/    CI, image release and Terraform plan workflows
```

Local checks do not require cloud credentials. The AWS and Kubernetes paths are kept separate so infrastructure can be validated in CI and deployed when an AWS account and cluster are available.
