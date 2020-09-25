import { Database } from "../deps.ts";
import Token from "./token.ts";
import Application from "./application.ts";

const db = new Database("postgres", {
  host: Deno.env.get("host")!,
  username: Deno.env.get("username")!,
  password: Deno.env.get("password")!,
  database: Deno.env.get("database")!,
});

db.link([Token,Application]);
//await db.sync({ drop: true });
await db.sync();
console.log("CONNECTED");

export {Token,Application};