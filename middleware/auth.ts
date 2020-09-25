
const auth = async(ctx: any, next: any)  => {
    
    const token = ctx.request.headers.get('Authorization');
    const auth = Deno.env.get("token");
    if (token === auth) {
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