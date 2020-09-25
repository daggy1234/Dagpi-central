import { Application } from "./deps.ts";
import trouter from "./routes/router.ts";
import auth from "./middleware/auth.ts";
import logger from "https://deno.land/x/oak_logger/mod.ts";
import errorHandler from "./controllers/errorhandler.ts";
import env from "./utils/envs.ts";

const HOST = env.HOST || "0.0.0.0";
const PORT = env.PORT || 7000;

const app = new Application();
app.use(auth);
app.use(logger.logger);
app.use(logger.responseTime);
app.use(trouter.routes());
app.use(trouter.allowedMethods());
app.use(errorHandler);


app.use((ctx) => {
  ctx.response.body = "Hello World!";
});


app.addEventListener("listen", ({ secure, hostname, port }) => {
  const protocol = secure ? "https://" : "http://";
  const url = `${protocol}${hostname ?? "localhost"}:${port}`;
  console.log(
    `Listening on: ${(url)}`,
  );
});
await app.listen(`${HOST}:${PORT}`);
