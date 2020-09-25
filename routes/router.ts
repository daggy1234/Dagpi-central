import { Router } from "https://deno.land/x/oak@v6.1.0/mod.ts";
import {
  Tokens,
  getToken,
  addToken,
  deleteToken,
  updateToken,
} from "./tokens/index.ts";
import {
  Apps, AddApp, GetApp, DeleteApp
} from "./app/index.ts";
const trouter = new Router();

trouter
  .get("/token", Tokens)
  .get("/usertoken/:user/", getToken)
  .post("/addtoken/:user/", addToken)
  .delete("/deletetoken/:user/", deleteToken)
  .patch("/updatetoken/:user/", updateToken)
  .get("/app",Apps)
  .post("/addapp",AddApp)
  .get("/userapp/:user/",GetApp)
  .delete("/deleteapp/:user/",DeleteApp);
export default trouter;
