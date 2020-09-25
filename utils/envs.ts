import { config } from "https://deno.land/x/dotenv/mod.ts";

const env = config();

console.log("LOADED ENV");
console.log(env.deployment);

export default env;