function loadModule(moduleName) {
  try {
    const module = require(moduleName);
    console.log("\x1b[32m%s\x1b[0m", `${moduleName} loaded successfully`);
    return module;
  } catch (error) {
    console.error("\x1b[31m%s\x1b[0m", `failed to load ${moduleName}`, error);
    return null;
  }
}

const https = loadModule("https");
const express = loadModule("express");
const http = loadModule("http");
const socketIO = loadModule("socket.io");
const cors = loadModule("cors");
const fs = loadModule("fs");

const corsOptions = { origin: "https://apinor.no" };
if (!express || !http || !https || !socketIO || !cors || !fs) {
  console.error("One or more modules failed to load. Exiting...");
  process.exit(1);
}

import("node-fetch")
  .then(({ default: fetch }) => {})
  .catch((error) => {
    console.error("Failed to import node-fetch:", error);
  });

module.exports = { express, http, https, socketIO, cors, fs, corsOptions };
