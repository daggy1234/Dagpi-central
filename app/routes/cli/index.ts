import { AppRoute } from "../app-route";
import { db } from "../../db";
import rand from "csprng";
import { parse, sendEmailTemplate } from "../../utils";

import { Request, Response, Router } from "express";

export class CliRouter implements AppRoute {
  public route = "/cli";
  public router: Router = Router();

  constructor() {
    this.router.post("/", this.AddToken);
    this.router.delete("/", this.deleteToken);
  }

  public async AddToken(request: Request, response: Response): Promise<any> {
    console.log(request.body.length);
    if (!request.body) {
      response.status(400).send({ msg: "There is no form body" });
      return;
    }
    try {
      const { name, user } = request.body;
      const user_id = BigInt(user);
      const u = await db.db().user.findUnique({
        where: {
          userid: user_id,
        },
      });
      const token = await db.db().cli.create({
        data: {
          client_id: u.client_id,
          name: name,
          token: rand(256, 36),
        },
      });
      sendEmailTemplate(
        u.email,
        JSON.stringify({
          title: "New Dagpi admin token was generated",
          content: `Dear ${u.name}\nA new dagpi admin token was generated for your account.You can manage admin tokens in the dagpi user dashboard.\n\nIf it wasn't you who permitted this operation, reset you discord login immediately. and delete the token.\n\nSincerily,\nDagpi`,
        }),
        "DagpiAction"
      );
      response.send({ app: parse(token) });
      return;
    } catch (err) {
      response.status(500).send({
        status: "fail",
        message: err.toString(),
      });
    }
  }

  public async deleteToken(request: Request, response: Response): Promise<any> {
    console.log(request.body.length);
    if (!request.body) {
      response.status(400).send({ msg: "There is no form body" });
      return;
    }
    try {
      const { name, client_id } = request.body;
      const token = await db.db().cli.findFirst({
        where: {
          client_id: client_id,
          name: name,
        },
      });
      const deleted = await db.db().cli.delete({
        where: {
          id: token.id,
        },
      });
      response.send({ app: parse(deleted) });
      return;
    } catch (err) {
      response.status(500).send({
        status: "fail",
        message: err.toString(),
      });
    }
  }
}
