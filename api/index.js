"use strict";

let starting;
let app;

async function handler(request, response) {
  if (request.url === "/api/status" || request.url.endsWith("/api/status")) {
    response.statusCode = 200;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ status: "ok", runtime: "vercel", path: request.url }));
    return;
  }

  try {
    if (!app) {
      const serverModule = require("../server");
      app = serverModule.app;
      if (!starting) starting = serverModule.start();
      await starting;
    }
    return app(request, response);
  } catch (error) {
    console.error("Vercel invocation failed:", error);
    response.statusCode = 500;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify({
      error: "Aplikasi gagal dijalankan.",
      detail: error && error.message ? error.message : "Kesalahan tidak diketahui."
    }));
  }
}

module.exports = handler;
