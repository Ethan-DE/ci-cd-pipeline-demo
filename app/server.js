const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (_req, res) => res.json({ status: "ok", service: "hello-ci" }));

app.listen(port, () => console.log(`server listening on ${port}`));
