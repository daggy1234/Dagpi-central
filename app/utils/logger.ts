import morgan from "morgan";
import { createLogger, transports, format } from "winston";

const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
    format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new transports.File({
      filename: "all-logs.log",
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new transports.Console(),
  ],
});

class MySteam {
  write(message: string) {
    logger.info(message.substring(0, message.lastIndexOf("\n")));
  }
}

const stream = new MySteam();

const mgan = morgan(
  ":method :url :status :response-time ms - :res[content-length]",
  { stream: stream }
);

export default mgan;
