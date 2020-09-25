import env from "../utils/envs.ts";
import {Status } from "https://deno.land/x/oak/mod.ts";
const auth = async(ctx: any, next: any)  => {
    
    const token = ctx.request.headers.get('Authorization');
    if (token === env.token) {
        await next();
    } else {
        ctx.response.status = 403;
        ctx.response.body = {
            status: false,
            message: "Unauthorized"
        };
    }
    
  };

export default auth;