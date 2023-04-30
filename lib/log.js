const { createLogger, format, transports, level } = require('winston');
const { combine, timestamp, label, colorize, printf } = format;
const ENV = process.env.NODE_ENV;

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

function getLogger(module) {
    const path = module.filename.split('\\').slice(-2).join('\\');

    return createLogger({
        level: (ENV === 'development') ? 'debug' : 'error',
        format: combine(
            label({ label: path }),
            colorize({
                level: true,
            }),
            timestamp({ format: 'isoDateTime' }),
            myFormat
        ),
        transports: [new transports.Console()]
    })
}

module.exports = getLogger;
