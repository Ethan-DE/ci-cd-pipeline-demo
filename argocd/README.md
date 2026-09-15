# Argo CD applications

Apply the monitoring application first so the Prometheus Operator CRDs exist before the status-api chart creates its ServiceMonitor and PrometheusRule.

```bash
kubectl apply -f argocd/monitoring.yaml
kubectl apply -f argocd/status-api.yaml
```

The application image is published by `.github/workflows/release.yml`. The current chart tracks the `latest` tag. For stricter promotion, pin a release tag in the Argo CD values and move that change through review.
