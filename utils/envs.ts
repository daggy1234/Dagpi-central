import {config} from "../deps.ts"

const env = config();

console.log("LOADED ENV");
console.log(env.deployment);

export default env;