import { AppRoute } from "../app-route";
import { db } from "../../db";
import { parse, newToken, sendEmailTemplate } from "../../utils";
import { AxiosResponse } from "axios";
import { http } from "../../http";
import { Request, Response, Router } from "express";

export class TokenRouter implements AppRoute {
  public route = "/tokens";
  public router: Router = Router();
  // public http: AxiosInstance = axios.create(config);

  constructor() {
    this.router.get("/tokens", this.getTokens);
    this.router.get("/:user", this.GetToken);
    this.router.post("/:user", this.AddToken);
    this.router.patch("/:user", this.updateToken);
    this.router.get("/auth/:user", this.getTokenApi);
    this.router.delete("/:user", this.DeleteToken);
  }

  async getTokens(_request: Request, response: Response): Promise<any> {
    const tokens = await db.db().tokens.findMany();
    response.send({ tokens: parse(tokens) });
  }

  async GetToken(request: Request, response: Response) {
    const params = request.params;
    if (params.user) {
      const userid = BigInt(params.user);
      const data = await db.db().tokens.findUnique({
        where: {
          userid: userid,
        },
      });
      response.send({ data: parse(data) });
    } else {
      response.status(400).send({ err: "No Parameter for Userid" });
    }
  }

  async getTokenApi(request: Request, response: Response) {
    try {
      const params = request.params;
      if (params.user) {
        const userid = BigInt(params.user);
        const data = await db.db().tokens.findUnique({
          where: {
            userid: userid,
          },
        });
        const token: string = data.apikey;
        if (token) {
          const resp: AxiosResponse = await http.client().get(`auth/${token}`);
          const dat =
            resp.status === 200
              ? { data: resp.data, status: true }
              : { data: resp.data, status: false };
          response.send(dat);
        } else {
          response
            .status(500)
            .send({ message: "No token exists for the user" });
        }
      } else {
        response.status(400).send({ err: "No Parameter for Userid" });
      }
    } catch (err) {
      response.status(500).send({
        status: "fail",
        message: err.toString(),
      });
    }
  }

  async DeleteToken(request: Request, response: Response) {
    try {
      const params = request.params;
      if (params.user) {
        const userid = BigInt(params.user);
        const data = await db.db().tokens.findUnique({
          where: {
            userid: userid,
          },
        });
        const token: string = data.apikey;
        if (token) {
          const resp: AxiosResponse = await http
            .client()
            .get(`deletekey/${token}`);
          const dat =
            resp.status === 200
              ? { data: resp.data, status: true }
              : { data: resp.data, status: false };
          const del = await db.db().tokens.delete({
            where: {
              userid: userid,
            },
          });
          response.send({ api: parse(dat), del: parse(del) });
        } else {
          response
            .status(500)
            .send({ message: "No token exists for the user" });
        }
      } else {
        response.status(400).send({ err: "No Parameter for Userid" });
      }
    } catch (err) {
      response.status(500).send({
        status: "fail",
        message: err.toString(),
      });
    }
  }

  async AddToken(request: Request, response: Response) {
    try {
      if (request.params.user) {
        const userid = BigInt(request.params.user);
        const user = await db.db().user.findUnique({
          where: {
            userid: userid,
          },
        });
        const token = newToken(user.client_id);
        const resp = await http.client().get(`addkey/${token}/${userid}`);
        const dat =
          resp.status === 200
            ? { data: resp.data, status: true }
            : { data: resp.data, status: false };
        if (dat.status) {
          await db.db().tokens.create({
            data: {
              userid: userid,
              apikey: token,
              totaluses: 0,
              enhanced: false,
              ratelimit: 60,
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
        response.status(400).send({ err: "No Parameter for Userid" });
      }
    } catch (err) {
      response.status(500).send({
        status: "fail",
        message: err.toString(),
      });
    }
  }

  async updateToken(request: Request, response: Response) {
    try {
      if (request.params.user) {
        const userid = BigInt(request.params.user);
        const user = await db.db().user.findUnique({
          where: {
            userid: userid,
          },
        });
        const token = newToken(user.client_id);
        const resp = await http.client().get(`resetkey/${token}/${userid}`);
        const dat =
          resp.status === 200
            ? { data: resp.data, status: true }
            : { data: resp.data, status: false };
        if (dat.status) {
          await db.db().tokens.update({
            where: {
              userid: userid,
            },
            data: {
              apikey: token,
            },
          });
          sendEmailTemplate(user.email, JSON.stringify({}), "DagpiTokReset");
          response.send(dat);
        } else {
          response.status(500).send({
            status: "fail",
            message: "couldn't get an error",
          });
        }
      } else {
        response.status(400).send({ err: "No Parameter for Userid" });
      }
    } catch (err) {
      response.status(500).send({
        status: "fail",
        message: err.toString(),
      });
    }
  }
}

// import { AppRoute } from "../app-route";
// import { db } from "../../db";
// import { parse, newToken, sendEmailTemplate } from "../../utils";
// import { AxiosResponse } from "axios";
// import { http } from "../../http";
// import { Request, Response, Router } from "express";

// export class TokenRouter implements AppRoute {
//   public route = "/tokens";
//   public router: Router = Router();
//   // public http: AxiosInstance = axios.create(config);

//   constructor() {
//     this.router.get("/tokens", this.getTokens);
//     this.router.get("/:user", this.GetToken);
//     this.router.post("/:user", this.AddToken);
//     this.router.patch("/:user", this.updateToken);
//     this.router.get("/auth/:user", this.getTokenApi);
//     this.router.delete("/:user", this.DeleteToken);
//   }

//   async getTokens(_request: Request, response: Response): Promise<any> {
//     const tokens = await db.db().tokens.findMany();
//     response.send({ tokens: parse(tokens) });
//   }

//   async GetToken(request: Request, response: Response) {
//     const params = request.params;
//     if (params.user) {
//       const userid = BigInt(params.user);
//       const data = await db.db().tokens.findUnique({
//         where: {
//           userid: userid,
//         },
//       });
//       response.send({ data: parse(data) });
//     } else {
//       response.status(400).send({ err: "No Parameter for Userid" });
//     }
//   }

//   async getTokenApi(request: Request, response: Response) {
//     try {
//       const params = request.params;
//       if (params.user) {
//         const userid = BigInt(params.user);
//         const data = await db.db().tokens.findUnique({
//           where: {
//             userid: userid,
//           },
//         });
//         const token: string = data.apikey;
//         response.send(parse(data));
//       } else {
//         response.status(400).send({ err: "No Parameter for Userid" });
//       }
//     } catch (err) {
//       response.status(500).send({
//         status: "fail",
//         message: err.toString(),
//       });
//     }
//   }

//   async DeleteToken(request: Request, response: Response) {
//     try {
//       const params = request.params;
//       if (params.user) {
//         const userid = BigInt(params.user);
//         const data = await db.db().tokens.findUnique({
//           where: {
//             userid: userid,
//           },
//         });
//         const token: string = data.apikey;
//         if (token) {
//           const del = await db.db().tokens.delete({
//             where: {
//               userid: userid,
//             },
//           });
//           response.send({ api: parse(del), del: parse(del) });
//         } else {
//           response
//             .status(500)
//             .send({ message: "No token exists for the user" });
//         }
//       } else {
//         response.status(400).send({ err: "No Parameter for Userid" });
//       }
//     } catch (err) {
//       response.status(500).send({
//         status: "fail",
//         message: err.toString(),
//       });
//     }
//   }

//   async AddToken(request: Request, response: Response) {
//     try {
//       if (request.params.user) {
//         const userid = BigInt(request.params.user);
//         const user = await db.db().user.findUnique({
//           where: {
//             userid: userid,
//           },
//         });
//         const token = newToken(user.client_id);
//         const n = await db.db().tokens.create({
//           data: {
//             userid: userid,
//             apikey: token,
//             totaluses: 0,
//             enhanced: false,
//             ratelimit: 60,
//           },
//         });
//         response.send(parse(n));
//       } else {
//         response.status(400).send({ err: "No Parameter for Userid" });
//       }
//     } catch (err) {
//       response.status(500).send({
//         status: "fail",
//         message: err.toString(),
//       });
//     }
//   }

//   async updateToken(request: Request, response: Response) {
//     try {
//       if (request.params.user) {
//         const userid = BigInt(request.params.user);
//         const user = await db.db().user.findUnique({
//           where: {
//             userid: userid,
//           },
//         });
//         const token = newToken(user.client_id);
//         const resp = await http.client().get(`resetkey/${token}/${userid}`);
//         const dat =
//           resp.status === 200
//             ? { data: resp.data, status: true }
//             : { data: resp.data, status: false };
//         if (dat.status) {
//           await db.db().tokens.update({
//             where: {
//               userid: userid,
//             },
//             data: {
//               apikey: token,
//             },
//           });
//           sendEmailTemplate(user.email, JSON.stringify({}), "DagpiTokReset");
//           response.send(parse(dat));
//         } else {
//           response.status(500).send({
//             status: "fail",
//             message: "couldn't get an error",
//           });
//         }
//       } else {
//         response.status(400).send({ err: "No Parameter for Userid" });
//       }
//     } catch (err) {
//       response.status(500).send({
//         status: "fail",
//         message: err.toString(),
//       });
//     }
//   }
// }
