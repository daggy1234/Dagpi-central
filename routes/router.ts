import { Router } from "../deps.ts";
import {
  addToken,
  deleteToken,
  getToken,
  Tokens,
  updateToken,
  updateLimit
} from "./tokens/index.ts";
import { AddApp, ApproveApp, Apps, DeleteApp, GetApp } from "./app/index.ts";
const trouter = new Router();

trouter
  .get("/token", Tokens)
  .get("/usertoken/:user/", getToken)
  .post("/addtoken/:user/", addToken)
  .delete("/deletetoken/:user/", deleteToken)
  .patch("/updatetoken/:user/", updateToken)
  .get("/app", Apps)
  .post("/addapp", AddApp)
  .get("/userapp/:user/", GetApp)
  .delete("/deleteapp/:user/", DeleteApp)
  .patch("/changelimit/:user/:limit/", updateLimit)
  .patch("/approveapp/:user/", ApproveApp);
export default trouter;
