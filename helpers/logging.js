'use strict';
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const fs = require('fs');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const logDir = env === 'development' ? '/tmp/scrapers/' : '/var/log/scrapers/';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

function getLogger() {
  var moduleName = path.basename(process.mainModule.filename);
  var filename = path.join(logDir, moduleName + '.log');

  const dailyRotateFileTransport = new transports.DailyRotateFile({
    filename: `${logDir}/${moduleName}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    maxFiles: '2d',
  });

  var logger = createLogger({
    // change level if in dev environment versus production
    level: env === 'development' ? 'debug' : 'info',
    format: format.combine(
      format.label({ label: moduleName }),
      format.colorize(),
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      format.printf(info => `[${info.label}] ${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
      new transports.Console({
        level: 'debug',
        format: format.combine(
          format.colorize(),
          format.printf(info => `[${info.label}] ${info.timestamp} ${info.level}: ${info.message}`)
        ),
      }),
      dailyRotateFileTransport,
    ],
  });

  return logger;
}

module.exports = {
  getLogger: getLogger,
};
