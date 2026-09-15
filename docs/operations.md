# Operations notes

## Health endpoints

- `/health` checks that the process is alive.
- `/ready` is used for readiness and returns 503 while the process is draining.
- `/metrics` exposes Prometheus-format application metrics.

## Graceful shutdown

The service handles SIGTERM, marks itself as draining, and closes the HTTP server. The Helm chart also adds a short pre-stop delay so an ingress/service has time to stop routing new connections before the process exits.

## Local observability

```bash
docker compose --profile observability up --build -d
```

Then use:

- API: `http://localhost:3000`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001` (default local credentials are `admin` / `admin` on first start)
- Loki API: `http://localhost:3100`
- Alloy UI: `http://localhost:12345`

Useful PromQL examples:

```promql
sum(rate(status_api_requests_total[5m]))
```

```promql
sum by (status) (rate(status_api_requests_total[5m]))
```

The container writes JSON logs to stdout. Alloy discovers Docker containers through the local Docker socket and forwards their logs to Loki.
