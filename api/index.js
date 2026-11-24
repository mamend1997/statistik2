"use strict";

const { app, start } = require("../server");

let starting;

async function handler(request, response) {
  try {
    if (!starting) {
      starting = start();
    }
    await starting;
    return app(request, response);
  } catch (error) {
    console.error("Vercel invocation failed:", error);
    response.statusCode = 500;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify({
      error: "Aplikasi gagal dijalankan.",
      detail: process.env.NODE_ENV === "development" ? error.message : undefined
    }));
  }
}

module.exports = handler;
