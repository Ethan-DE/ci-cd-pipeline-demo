const http = require("http");

function request(path) {
  return new Promise((resolve, reject) => {
    const req = http.get({ host: "127.0.0.1", port: 3000, path }, res => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", chunk => { body += chunk; });
      res.on("end", () => resolve({ res, body }));
    });
    req.on("error", reject);
  });
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

async function run() {
  const root = await request("/");
  expect(root.res.statusCode === 200, `/ returned ${root.res.statusCode}`);
  expect(JSON.parse(root.body).service === "status-api", "/ returned unexpected body");
  expect(Boolean(root.res.headers["x-request-id"]), "missing x-request-id header");

  const health = await request("/health");
  expect(health.res.statusCode === 200, `/health returned ${health.res.statusCode}`);

  const ready = await request("/ready");
  expect(ready.res.statusCode === 200, `/ready returned ${ready.res.statusCode}`);

  const metrics = await request("/metrics");
  expect(metrics.res.statusCode === 200, `/metrics returned ${metrics.res.statusCode}`);
  expect(metrics.body.includes("status_api_requests_total"), "metrics counter missing");
  expect(metrics.body.includes("status_api_build_info"), "build metric missing");

  const missing = await request("/missing");
  expect(missing.res.statusCode === 404, `/missing returned ${missing.res.statusCode}`);
}

run().catch(err => {
  console.error(err.message);
  process.exit(1);
});
