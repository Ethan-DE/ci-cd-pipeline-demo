const crypto = require("crypto");
const http = require("http");

const port = Number(process.env.PORT || 3000);
const version = process.env.APP_VERSION || "dev";
const startedAt = Date.now();
const requests = new Map();
let shuttingDown = false;

function count(route, statusCode) {
  const key = `${route}|${statusCode}`;
  requests.set(key, (requests.get(key) || 0) + 1);
}

function logRequest(req, route, statusCode, started, requestId) {
  const durationMs = Number(process.hrtime.bigint() - started) / 1e6;
  console.log(JSON.stringify({
    time: new Date().toISOString(),
    request_id: requestId,
    method: req.method,
    route,
    status: statusCode,
    duration_ms: Number(durationMs.toFixed(2)),
  }));
}

function finish(req, res, route, statusCode, body, contentType, started, requestId) {
  count(route, statusCode);
  res.writeHead(statusCode, {
    "content-type": contentType,
    "x-request-id": requestId,
  });
  res.end(body);
  logRequest(req, route, statusCode, started, requestId);
}

function metrics() {
  const lines = [
    "# HELP status_api_uptime_seconds Process uptime in seconds.",
    "# TYPE status_api_uptime_seconds gauge",
    `status_api_uptime_seconds ${Math.floor((Date.now() - startedAt) / 1000)}`,
    "# HELP status_api_build_info Build information.",
    "# TYPE status_api_build_info gauge",
    `status_api_build_info{version="${version.replaceAll('"', '\\"')}"} 1`,
    "# HELP status_api_requests_total HTTP requests handled by route and status.",
    "# TYPE status_api_requests_total counter",
  ];

  for (const [key, value] of [...requests.entries()].sort()) {
    const [route, status] = key.split("|");
    lines.push(`status_api_requests_total{route="${route}",status="${status}"} ${value}`);
  }

  return `${lines.join("\n")}\n`;
}

const server = http.createServer((req, res) => {
  const started = process.hrtime.bigint();
  const requestId = req.headers["x-request-id"] || crypto.randomUUID();
  const path = new URL(req.url, "http://localhost").pathname;

  if (req.method !== "GET") {
    return finish(req, res, path, 405, JSON.stringify({ error: "method_not_allowed" }), "application/json", started, requestId);
  }

  if (path === "/health") {
    return finish(req, res, path, 200, JSON.stringify({ status: "ok" }), "application/json", started, requestId);
  }

  if (path === "/ready") {
    const statusCode = shuttingDown ? 503 : 200;
    const body = shuttingDown ? { status: "draining" } : { status: "ready" };
    return finish(req, res, path, statusCode, JSON.stringify(body), "application/json", started, requestId);
  }

  if (path === "/metrics") {
    return finish(req, res, path, 200, metrics(), "text/plain; version=0.0.4", started, requestId);
  }

  if (path === "/") {
    return finish(
      req,
      res,
      path,
      200,
      JSON.stringify({ service: "status-api", status: "ok", version }),
      "application/json",
      started,
      requestId,
    );
  }

  return finish(req, res, path, 404, JSON.stringify({ error: "not_found" }), "application/json", started, requestId);
});

server.listen(port, "0.0.0.0", () => {
  console.log(JSON.stringify({ time: new Date().toISOString(), message: "status-api started", port, version }));
});

function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(JSON.stringify({ time: new Date().toISOString(), message: "shutdown requested", signal }));

  const timer = setTimeout(() => process.exit(1), 10000);
  timer.unref();

  server.close(() => process.exit(0));
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
