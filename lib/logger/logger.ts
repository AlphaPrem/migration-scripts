// src/logger.ts
// -----------------------------------------------------------------------------
//  • All log entries (info → error → fatal) are appended to ./critical.logs
//  • Console output is colorised & timestamped for easy reading
//  • Works out of the box with ts‑node or after tsc compilation
// -----------------------------------------------------------------------------

import fs from "fs";
import path from "path";
import { createLogger, format, transports, Logger } from "winston";

// ---------- Ensure the log directory exists ----------------------------------
const LOG_FILE = path.join(__dirname, "critical.logs");
const logDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// ---------- Winston Formats ---------------------------------------------------
const { combine, timestamp, printf, colorize, errors, splat } = format;

const fileFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  // Write stack trace if present; otherwise write message
  const base = stack || message;
  const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return `${timestamp} ${level}: ${base}${extra}`;
});

const consoleFormat = combine(
  colorize({ all: true }),
  printf(({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`)
);

// ---------- Create and export the logger -------------------------------------
const logger: Logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    errors({ stack: true }), // capture stack traces
    splat() // sprintf‑style
  ),
  transports: [
    new transports.File({
      filename: LOG_FILE,
      level: "info", // log everything >= info to the file
      format: fileFormat,
      maxsize: 5 * 1024 * 1024, // 5 MB per file (optional)
      maxFiles: 5, // keep last 5 files (optional)
    }),
    new transports.Console({
      level: "info",
      format: consoleFormat,
    }),
  ],
});

// ---------- Example usage -----------------------------------------------------
// logger.info('Server started on port %d', 3000);
// logger.error(new Error('Unexpected failure'), 'Service crashed');

export default logger;
