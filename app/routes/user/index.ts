import { AppRoute } from "../app-route";
import { db } from "../../db";
import { parse, makeid, csprng, sendEmailTemplate } from "../../utils";

import { Request, Response, Router } from "express";

export class UserRouter implements AppRoute {
  public route = "/user";
  public router: Router = Router();

  constructor() {
    this.router.post("/", this.AddUser);
    this.router.get("/:user", this.GetUser);
    this.router.delete("/:user", this.deleteUser);
    this.router.get("/profile/:user", this.UserProfile);
  }

  public async AddUser(request: Request, response: Response): Promise<any> {
    console.log(request.body.length);
    if (!request.body) {
      response.status(400).send({ msg: "There is no form body" });
      return;
    }
    try {
      const { name, email, user } = request.body;
      const user_id = BigInt(user);
      const client_id: string = makeid(32);
      const client_secret: string = csprng(128);
      console.log(client_secret);
      const user_p = await db.db().user.create({
        data: {
          userid: user_id,
          email: email,
          name: name,
          client_secret: client_secret,
          client_id: client_id,
        },
      });
      sendEmailTemplate(email, JSON.stringify({ name: name }), "DagpiWelcome");
      response.send({ app: parse(user_p) });
      return;
    } catch (err) {
      response.status(500).send({
        status: "fail",
        message: err.toString(),
      });
    }
  }

  public async GetUser(request: Request, response: Response): Promise<any> {
    if (request.params.user) {
      const userid = BigInt(request.params.user);
      const data = await db.db().user.findUnique({
        where: {
          userid: userid,
        },
      });
      response.send({ data: parse(data) });
    } else {
      response.status(400).send({ err: "No Parameter for Userid" });
    }
  }

  public async deleteUser(request: Request, response: Response): Promise<any> {
    if (request.params.user) {
      const userid = BigInt(request.params.user);
      const data = await db.db().user.delete({
        where: {
          userid: userid,
        },
      });
      response.send({ data: parse(data) });
    } else {
      response.status(400).send({ err: "No Parameter for Userid" });
    }
  }

  public async UserProfile(request: Request, response: Response): Promise<any> {
    if (request.params.user) {
      const userid = BigInt(request.params.user);
      const app = await db.db().application.findUnique({
        where: {
          appuserid: userid,
        },
      });
      const user = await db.db().user.findUnique({
        where: {
          userid: userid,
        },
      });
      const client_id = user.client_id;
      const cli_tokens = await db.db().cli.findMany({
        where: {
          client_id: client_id,
        },
      });
      const token = await db.db().tokens.findUnique({
        where: {
          userid: userid,
        },
      });
      response.send({
        app: parse(app),
        token: parse(token),
        cli: parse(cli_tokens),
        user: parse(user),
      });
    } else {
      response.status(400).send({ err: "No Parameter for Userid" });
    }
  }
}
