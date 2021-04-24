/* eslint-disable security/detect-possible-timing-attacks */
import { Request, Response, NextFunction } from "express";

const auth = (request: Request, response: Response, next: NextFunction) => {
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
};

export default auth;
