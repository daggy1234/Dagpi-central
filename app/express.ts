import { json, urlencoded } from "body-parser";
import { auth } from "./middleware";
import { mgan } from "./utils";
import * as http from "http";
import express from "express";

import { AppRouting } from "./routes";

export class Api {
  public app: express.Application;
  private router: express.Router;

  constructor() {
    this.app = express();
    this.router = express.Router();
    this.init();
  }

  private init() {
    this.loadMiddleware();
    this.addRoutes();
    this.errorHandler();
  }

  loadMiddleware() {
    // this.app.use(auth);
    this.app.use(json({ limit: "50mb" }));
    this.app.use(urlencoded({ limit: "50mb", extended: true }));
    this.app.use(mgan);
  }

  addRoutes() {
    this.app.use((request, res, next) => {
      if (request.url === "/") {
        res.send({
          message:
            "This is a private api dagpi uses to manage central/admin stuff. All protected. Visit dashboard at https://dagpi.xyz instead!",
        });
      } else {
        next();
      }
    });
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
