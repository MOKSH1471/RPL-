import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import 'winston-daily-rotate-file';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log level based on environment
const getLevel = () => {
  const env = process.env.NODE_ENV || 'dev';
  return env === 'prod' || env === 'production' ? 'info' : 'debug';
};

// Structured JSON format for file transports
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Human-readable format for console
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, correlationId, userId, ...meta }) => {
    const ctx = [
      correlationId && `reqId=${correlationId}`,
      userId && `user=${userId}`,
    ]
      .filter(Boolean)
      .join(' ');
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}${ctx ? ` [${ctx}]` : ''}: ${message}${metaStr}`;
  })
);

function buildLogger() {
  const defaultLogDir = path.join(__dirname, '../../logs');
  const LOG_DIR = process.env.LOG_DIR || defaultLogDir;

  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn(`[LOGGER WARNING] Could not create log directory ${LOG_DIR}: ${err.message}`);
  }

  const fileTransport = new winston.transports.DailyRotateFile({
    filename: path.join(LOG_DIR, 'rpl-application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    format: jsonFormat,
  });

  const errorFileTransport = new winston.transports.DailyRotateFile({
    filename: path.join(LOG_DIR, 'rpl-error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error',
    format: jsonFormat,
  });

  const consoleTransport = new winston.transports.Console({
    format: consoleFormat,
    forceConsole: true,
  });

  return winston.createLogger({
    level: getLevel(),
    levels,
    transports: [fileTransport, errorFileTransport, consoleTransport],
  });
}

let instance = null;
const boundCache = {};

// Proxy pattern identical to Aashray for deferred instantiation
const logger = new Proxy(
  {},
  {
    get(_target, prop) {
      if (!instance) {
        instance = buildLogger();
      }
      const value = instance[prop];
      if (typeof value !== 'function') return value;
      return (boundCache[prop] ??= value.bind(instance));
    },
  }
);

export default logger;
