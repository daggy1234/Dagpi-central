/* eslint-disable security/detect-possible-timing-attacks */
import { Request, Response, NextFunction } from "express";

const auth = (request: Request, response: Response, next: NextFunction) => {
  let match;
  try {
    match = request.url.toString().match(/^\/[^/]+\//g)[0];
  } catch (err) {
    match = "";
  }
  if (
    request.url == "/" ||
    ["/self/"].includes(match) ||
    request.url == "/payments/stripe"
  ) {
    if (request.url == "/") {
      response.send({
        message:
          "This is a private api dagpi uses to manage central/admin stuff. All protected. Visit dashboard at https://dagpi.xyz instead!",
      });
    } else {
      next();
    }
  } else {
    const token = request.headers["authorization"];
    const auth = process.env.TOKEN;
    if (token === auth) {
      next();
    } else {
      response.status(403).send({
        status: false,
        message: "Unauthorized",
      });
    }
  }
};

export default auth;
