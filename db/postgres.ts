import { Database } from "https://deno.land/x/denodb/mod.ts";
import env from "../utils/envs.ts";
import Token from "./token.ts";
import Application from "./application.ts";

const db = new Database("postgres", {
  host: env.host,
  username: env.username,
  password: env.password,
  database: env.database,
});

db.link([Token,Application]);
//await db.sync({ drop: true });
await db.sync();
console.log("CONNECTED");

export {Token,Application};