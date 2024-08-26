import winston from "winston"
const { combine, timestamp, printf } = winston.format
import dayjs from "dayjs";
import { env } from "@/config/env";
import * as rfs from "rotating-file-stream"
import expressWinston from "express-winston"
import path from "path";
import fs from "fs"

const myFormat: winston.Logform.Format = printf((
  { level, message, timestamp }: winston.Logform.TransformableInfo) => {

  return `${timestamp} ${level}: ${message}`

});

export const getTransports = (name: string): winston.transports.ConsoleTransportInstance[] | winston.transports.StreamTransportInstance[] => {
  if (env.NODE_ENV === "production") {
    const logDirectory = path.resolve(__dirname, `../../logs/${name}`);

    if (!fs.existsSync(logDirectory)) {
      fs.mkdirSync(logDirectory, { recursive: true });
    }

    return [new winston.transports.Stream({
      stream: rfs.createStream(`${name}.log.txt`, {
        interval: '1d',
        path: logDirectory
      })
    })]
  }
  else {
    return [new winston.transports.Console()]
  }
}

export const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({
        format: () => `TIME: ${dayjs().format()}`
    }),
    myFormat
  ),
  transports: getTransports("app")
})

export const expressWinstonLogger = expressWinston.logger({
  transports: getTransports("express"),
  format: combine(
    timestamp({
      format: () => `TIME: ${dayjs().format()}`
    }),
    myFormat
  ),
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}}\n',
  expressFormat: true
})

export const expressWinstonErrorLogger = expressWinston.errorLogger({
	transports: getTransports("express"),
	format: combine(
    timestamp({
      format: () => `TIME: ${dayjs().format()}`
    }),
    myFormat
  ),
});