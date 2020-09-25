import { Database } from "../deps.ts";
import Token from "./token.ts";
import Application from "./application.ts";


console.log(`BEGIN CONNECTING ${Deno.env.get("USERNAME")}`)
console.log(Deno.env.get("FLY_ALLOC_ID"));

const db = new Database("postgres", {
  host: Deno.env.get("HOST")!,
  username: Deno.env.get("USERNAME")!,
  password: Deno.env.get("PASSWORD")!,
  database: Deno.env.get("DATABASE")!,
});

db.link([Token,Application]);
//await db.sync({ drop: true });
await db.sync();
console.log("CONNECTED");

export {Token,Application};