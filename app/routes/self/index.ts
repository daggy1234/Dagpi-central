import { AppRoute } from "../app-route";
import { db } from "../../db";
import { http } from "../../http";
import { parse } from "../../utils";

import { Request, Response, Router } from "express";

export class SelfRouter implements AppRoute {
  public route = "/self";
  public router: Router = Router();

  constructor() {
    this.router.get("/:admin_token", this.getData);
  }

  async getData(request: Request, response: Response): Promise<any> {
    if (!request.params.admin_token) {
      response.status(400).send({
        err:
          "Needs both client_id and admin_token set in the url like /admin_token",
      });
    } else {
      const out = await db.db().cli.findUnique({
        where: {
          token: request.params.admin_token,
        },
      });
      if (out) {
        const c_id = out.client_id;
        const user = await db.db().user.findUnique({
          where: {
            client_id: c_id,
          },
        });
        const user_id = BigInt(user.userid);
        const app = await db.db().application.findUnique({
          where: {
            appuserid: user_id,
          },
        });
        const token = await db.db().tokens.findUnique({
          where: {
            userid: user_id,
          },
        });
        response.send(
          parse({
            user: user_id,
            app: app,
            token: token,
          })
        );
      } else {
        response
          .status(403)
          .send("Token sent was invalid/not present in our system");
      }
    }
  }

  async resetToken(request: Request, response: Response): Promise<any> {
    try {
      if (!request.params.admin_token) {
        response.status(400).send({
          err:
            "Needs both client_id and admin_token set in the url like /admin_token",
        });
      } else {
        const out = await db.db().cli.findUnique({
          where: {
            token: request.params.admin_token,
          },
        });
        if (out) {
          const c_id = out.client_id;
          const user = await db.db().user.findUnique({
            where: {
              client_id: c_id,
            },
          });
          const token = await db.db().tokens.findUnique({
            where: {
              userid: user.userid,
            },
          });
          if (token) {
            const resp = await http
              .client()
              .get(`resetkey/${token.apikey}/${user.userid}`);
            const dat =
              resp.status === 200
                ? { data: resp.data, status: true }
                : { data: resp.data, status: false };
            if (dat.status) {
              await db.db().tokens.update({
                where: {
                  userid: user.userid,
                },
                data: {
                  apikey: token.apikey,
                },
              });
              response.send(dat);
            } else {
              response.status(500).send({
                status: "fail",
                message: "couldn't get an error",
              });
            }
          } else {
            response.status(400).send({
              status: "fail",
              message: "There is no api token associated with your account.",
            });
          }
        } else {
          response
            .status(403)
            .send("Token sent was invalid/not present in our system");
        }
      }
    } catch (err) {
      response.status(500).send({
        status: "fail",
        message: err.toString(),
      });
    }
  }
}
