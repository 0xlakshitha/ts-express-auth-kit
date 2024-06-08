import winston from "winston"
const { combine, timestamp, printf } = winston.format
import dayjs from "dayjs";

const myFormat: winston.Logform.Format = printf((
    { level, message, timestamp } : winston.Logform.TransformableInfo) => {

  return `${timestamp} ${level}: ${message}`

});

let transports :
    winston.transports.FileTransportInstance[] |
    winston.transports.ConsoleTransportInstance[] = []

if (process.env.NODE_ENV === 'production') {
    transports = [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/info.log', level: 'info' })
    ];
} else {
    transports = [new winston.transports.Console()];
}

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({
        format: () => `TIME: ${dayjs().format()}`
    }),
    myFormat
  ),
  transports: transports
})

export default logger