// tiny test for CI
const http = require("http");
const req = http.request({ host: "localhost", port: 3000, path: "/", method: "GET" }, res => {
  process.exit(res.statusCode === 200 ? 0 : 1);
});
req.on("error", () => process.exit(1));
req.end();
