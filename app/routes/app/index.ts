import { v4 } from "uuid";
import { Request, Response, Router } from "express";
import { db } from "../../db";
import { AppRoute } from "../app-route";
import { parse, sendEmailTemplate, sendEmail } from "../../utils";

export class AppRouter implements AppRoute {
  public route = "/app";
  public router: Router = Router();

  constructor() {
    this.router.get("/apps", this.AllApps);
    this.router.get("/:appid", this.GetAppId);
    this.router.get("/user/:user", this.GetApp);
    this.router.patch("/:appid", this.ApproveApp);
    this.router.delete("/:appid", this.DeleteApp);
    this.router.post("/", this.AddApp);
    this.router.post("/reject", this.RejectApp);
  }

  public async AllApps(_req: Request, response: Response): Promise<any> {
    const data = await db.db().application.findMany();
    const js = parse(data);
    response.send({ Apps: js });
  }

  async GetApp(request: Request, response: Response) {
    const params = request.params;
    if (params.user) {
      const userid = BigInt(params.user);
      const data = await db.db().application.findUnique({
        where: {
          appuserid: userid,
        },
      });
      response.send({ data: parse(data) });
    } else {
      response.status(400).send({ err: "No Parameter for Userid" });
    }
  }

  async GetAppId(request: Request, response: Response) {
    const params = request.params;
    if (params.appid) {
      const appid = params.appid;
      const data = await db.db().application.findUnique({
        where: {
          uu: appid,
        },
      });
      response.send({ data: parse(data) });
    } else {
      response.status(400).send({ err: "No Parameter for Appid" });
    }
  }
  async ApproveApp(request: Request, response: Response) {
    const params = request.params;
    if (params.appid) {
      try {
        const app = await db.db().application.update({
          where: {
            uu: params.appid,
          },
          data: {
            approved: true,
          },
        });
        const user = await db.db().user.findUnique({
          where: {
            userid: app.appuserid,
          },
        });
        sendEmailTemplate(user.email, JSON.stringify({}), "DagpiApproval");
        response.send({ app: parse(app) });
      } catch (err) {
        response.status(500).send({
          status: "fail",
          message: err.toString(),
        });
      }
    }
  }

  async RejectApp(request: Request, response: Response) {
    if (!request.body) {
      response.status(400).send({ msg: "There is no form body" });
      return;
    }
    try {
      const { uu, reason } = request.body;
      const app = await db.db().application.delete({
        where: {
          uu: uu,
        },
      });
      const user_json = await db.db().user.findUnique({
        where: {
          userid: app.appuserid,
        },
      });
      sendEmail(
        user_json.email,
        "Your dagpi app was rejected",
        `Dear ${user_json.name}\nYour application just wasn't complete/had the following problems:\n${reason}\n.Don't worry, we have deleted the app you created. Feel free to create a new application, and we'll reapprove it.\nFrom,\nDagpi`
      );
      response.send({ app: parse(app) });
      return;
    } catch (err) {
      response.status(500).send({
        status: "fail",
        message: err.toString(),
      });
    }
  }

  async DeleteApp(request: Request, response: Response): Promise<any> {
    const params = request.params;
    try {
      if (params.appid) {
        // let data = await Application.where("uu", params.user).delete();
        const data = await db.db().application.delete({
          where: {
            uu: params.appid,
          },
        });
        const user = await db.db().user.findUnique({
          where: {
            userid: data.appuserid,
          },
        });
        sendEmailTemplate(
          user.email,
          JSON.stringify({
            title: "Dagpi App Deletion",
            message:
              "Hey your dagpi app was deleted along with corresponding tokens, cli tokens and more.",
            content:
              "Your Dagpi app was deleted. This means all linked api tokens and app related info are gone. To recreate an app, head to the dashboard and fill the form.",
          }),
          "DagpiAction"
        );
        response.send({ message: "Deleted", data: parse(data) });
      } else {
        response.status(400).send({ err: "No Parameter for App" });
      }
    } catch (err) {
      response.status(500).send({
        status: "fail",
        message: err.toString(),
      });
    }
  }

  async AddApp(request: Request, response: Response): Promise<any> {
    if (!request.body) {
      response.status(400).send({ msg: "There is no form body" });
      return;
    }
    try {
      const { name, description, url, user } = request.body;
      const userid = BigInt(user);
      const app = await db.db().application.create({
        data: {
          uu: v4(),
          appname: name,
          appurl: url,
          appdescription: description,
          appuserid: userid,
          approved: false,
          premium: false,
        },
      });
      const user_json = await db.db().user.findUnique({
        where: {
          userid: app.appuserid,
        },
      });
      sendEmailTemplate(
        user_json.email,
        JSON.stringify({
          title: "Dagpi app created",
          message:
            "Your dagpi application has been created and is on our team's review list",
          content:
            "Congratulations, you have submitted a dagpi application :). Our approvers will be reviewing your application and updating you on the discord. You will also recieve an email. Monitor status via the dashboard.",
        }),
        "DagpiAction"
      );
      response.send({ app: parse(app) });
      return;
    } catch (err) {
      response.status(500).send({
        status: "fail",
        message: err.toString(),
      });
    }
  }
}

// const AddApp = async (
//   { request, response }: { request: any; response: any },
// ) => {
//   if (!request.hasBody) {
//     response.status = 400;
//     response.body = { msg: "There is no form body" };
//     return;
//   }
//   try {
//     // let body = await request.body().value;
//     // console.log(body);
//     const { name, description, url, user } = await request.body().value;
//     let userid: bigint = BigInt(user);
//     const app = await  prisma.application.create({
//       data: {
//         uu: v4(),
//         appname: name,
//         appurl: url,
//         appdescription: description,
//         appuserid: userid,
//         approved: false,
//         premium: false
//       }

//     });
//     response.body = { app: app };
//     //console.log(name,description);
//     //response.body = {data: name};
//     return;
//   } catch (err) {
//     response.status = 500;
//     response.body = {
//       status: "fail",
//       message: err.toString(),
//     };
//   }
// };

// const PremiumApp = async (user: string): Promise<boolean> =>  {
//   if (user) {
//     try {
//       // let app = await Application.where("appuserid", user).update(
//       //   "premium",
//       //   true,
//       // );
//       let app = await prisma.application.update({
//         where: {
//           uu: user
//         },
//         data: {
//           premium: true
//         }
//       });
//       return true;
//     } catch (err) {
//       console.log(err);
//       return false;
//     }
//   } else {
//     return false;
//   }
// };

// const DeleteApp = async (
//   { params, response }: { params: { user: string }; response: any },
// ) => {
//   try {
//     if (params.user) {
//       // let data = await Application.where("uu", params.user).delete();
//       let data = await prisma.application.delete({
//         where: {
//           uu: params.user
//         }
//       });
//       response.body = { "data": "Deleted" };
//     } else {
//       response.status = 400;
//       response.body = { "err": "No Parameter for Userid" };
//     }
//   } catch (err) {
//     response.status = 500;
//     response.body = {
//       status: "fail",
//       message: err.toString(),
//     };
//   }
// };
// export { AddApp, ApproveApp, Apps, DeleteApp, GetApp, PremiumApp };
