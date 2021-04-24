import { Api } from "./express";
import { db } from "./db";
import { http } from "./http";
import dotenv from "dotenv";

dotenv.config();

const api = new Api();

api.run();
db.createInstance();
http.createInstance();

const app = api.app;

export { app };
