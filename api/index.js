"use strict";

const { app, start } = require("../server");

let starting;

async function handler(request, response) {
  if (!starting) {
    starting = start();
  }
  await starting;
  return app(request, response);
}

module.exports = handler;
