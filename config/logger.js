const winston = require('winston');
const path = require('path');
const fs = require('fs');

const logDir = process.env.LOG_DIR || 'logs';

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logLevel = process.env.LOG_LEVEL || 'info';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const safeStringify = (obj) => {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
      if (value instanceof Error) {
        return {
          message: value.message,
          stack: value.stack,
          name: value.name
        };
      }
      if (value.constructor && value.constructor.name === 'Socket') {
        return '[Socket]';
      }
      if (value.constructor && value.constructor.name === 'HTTPParser') {
        return '[HTTPParser]';
      }
    }
    return value;
  });
};

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      try {
        msg += ` ${safeStringify(meta)}`;
      } catch (err) {
        msg += ` [Unable to stringify meta: ${err.message}]`;
      }
    }
    return msg;
  })
);

const transports = [
  new winston.transports.Console({
    level: logLevel,
    format: consoleFormat,
    handleExceptions: true,
    handleRejections: true
  }),
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: logFormat,
    maxsize: 5242880,
    maxFiles: 5
  }),
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    level: logLevel,
    format: logFormat,
    maxsize: 5242880,
    maxFiles: 5
  })
];

if (process.env.NODE_ENV === 'production') {
  try {
    const DailyRotateFile = require('winston-daily-rotate-file');
    const dailyRotateFile = new DailyRotateFile({
      filename: path.join(logDir, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat
    });

    const auditRotateFile = new DailyRotateFile({
      filename: path.join(logDir, 'audit-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: logFormat
    });

    transports.push(dailyRotateFile, auditRotateFile);
  } catch (error) {
    console.warn('winston-daily-rotate-file not installed, using default file transports');
  }
}

const logger = winston.createLogger({
  levels: winston.config.npm.levels,
  level: logLevel,
  format: logFormat,
  defaultMeta: { service: 'careflow-ehr' },
  transports: transports,
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(logDir, 'exceptions.log') })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: path.join(logDir, 'rejections.log') })
  ],
  exitOnError: false
});

winston.addColors({
  audit: 'cyan'
});

module.exports = logger;

