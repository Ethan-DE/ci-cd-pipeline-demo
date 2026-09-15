# VM to EKS migration runbook

## Starting point

The source deployment is the Ansible-managed Ubuntu VM in `ansible/`: Nginx listens on port 80 and proxies to one Docker container on localhost. The target deployment is the Helm release in EKS.

The service is stateless, so this migration covers compute, networking, delivery and cutover. A stateful workload would add a separate database migration and consistency plan.

## 1. Baseline the source

Before changing traffic:

- record the current image tag and VM configuration
- run `scripts/smoke.sh` against the public VM endpoint
- capture normal request rate, error rate and latency
- reduce DNS TTL before the cutover window
- keep the VM deployment unchanged until the target has been stable

## 2. Build the target

1. Provision the VPC, ECR repository and EKS cluster with Terraform.
2. Publish the same application image used on the VM.
3. Install Argo CD and apply `argocd/status-api.yaml`.
4. Enable the ServiceMonitor only when a Prometheus Operator is present.
5. Expose the target through the chosen ingress/load balancer.

The target must pass `/health`, `/ready` and `/metrics` before it receives user traffic.

## 3. Validate parity

Run both deployments at the same time and compare their public responses:

```bash
./scripts/compare-endpoints.sh https://old.example.com https://new.example.com
```

Also check:

- pod restarts and readiness
- application logs
- request/error metrics
- image tag running in the target
- ingress/TLS behavior

## 4. Cut over

For a simple DNS cutover:

1. confirm the target is healthy
2. point DNS at the new ingress/load balancer
3. watch both old and new access logs while the previous TTL expires
4. keep the VM available but stop making changes to it
5. run smoke checks from more than one network if possible

For higher-risk systems, use weighted traffic or a load-balancer canary instead of a single DNS switch.

## 5. Roll back

Rollback is deliberately simple:

1. restore DNS/load-balancer traffic to the VM
2. verify the source endpoint with `scripts/smoke.sh`
3. leave the failed target running long enough to collect logs and metrics
4. fix the target before attempting another cutover

Do not destroy the VM during the first successful cutover. Decommission it only after an agreed observation period.

## What changes for a stateful service

A database-backed system would add backups, replication or export/import, schema compatibility, write freezes or dual-write considerations, data validation, and a database-specific rollback point. This project does not include a persistent data tier, so database migration is outside its current scope.
