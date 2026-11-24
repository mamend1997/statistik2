"use strict";

module.exports = function handler(request, response) {
  if (request.url === "/api/status" || request.url.endsWith("/api/status")) {
    response.statusCode = 200;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ status: "ok", runtime: "vercel", path: request.url }));
    return;
  }

  response.statusCode = 503;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify({
    error: "Diagnose mode: Express belum dipasang kembali.",
    path: request.url
  }));
};
