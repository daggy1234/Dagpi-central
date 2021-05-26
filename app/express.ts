/* eslint-disable @typescript-eslint/ban-ts-comment */
import { json, urlencoded } from "body-parser";
import { auth } from "./middleware";
import { mgan } from "./utils";
import * as http from "http";
import express from "express";
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";

import { AppRouting } from "./routes";

export class Api {
  public app: express.Application;
  private router: express.Router;

  constructor() {
    this.app = express();
    Sentry.init({
      dsn: process.env.SENTRY,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Tracing.Integrations.Express({ app: this.app }),
      ],
      tracesSampleRate: 1.0,
    });
    this.router = express.Router();
    this.init();
  }

  private init() {
    this.loadMiddleware();
    this.addRoutes();
    this.errorHandler();
  }

  loadMiddleware() {
    this.app.use(auth);
    this.app.use(
      json({
        limit: "50mb",
        verify: (req, res, buf) => {
          req.rawBody = buf;
        },
      })
    );
    this.app.use(urlencoded({ limit: "50mb", extended: true }));
    this.app.use(Sentry.Handlers.requestHandler());
    this.app.use(Sentry.Handlers.tracingHandler());
    this.app.use(mgan);
  }

  addRoutes() {
    this.app.use("/", this.router);
    new AppRouting(this.router);
  }

  private errorHandler() {
    this.app.use((request, res) => {
      res.status(404).send({ path: request.path, message: "does not exist" });
    });
  }

  public run() {
    const port = process.env.PORT || 8000;
    const server = http.createServer(this.app);
    console.log(`Starting server on ${port}`);
    server.listen(port);
    server.on("error", this.eh);
  }

  eh(error) {
    console.log(error.toString());
    const port = error.port;
    if (error.syscall !== "listen") {
      throw error;
    }
    const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;
    switch (error.code) {
      case "EACCES":
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case "EADDRINUSE":
        console.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  }
}
