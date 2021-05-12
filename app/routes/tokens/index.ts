import { AppRoute } from "../app-route";
import { db } from "../../db";
import { parse, newToken } from "../../utils";
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

// const updateLimit  = async (
//   { params, response }: { params: { user: string, limit: string }; response: any },
// ) => {
//   try {
//     if (params.user && params.limit) {
//       let limit = +params.limit;
//       let userid: bigint = BigInt(params.user);
//       let user = await Token.where("userid", params.user).all();
//       let token:string;
//       if (user[0].apikey) {
//         token = user[0].apikey.toString();
//       } else {
//         token= "penis";
//       };

//       let resp = await axios.get(`changelimits/${token}/${params.limit}`, config);
//       let dat = (resp.status === 200)
//         ? { "data": resp.data, "status": true }
//         : { "data": resp.data, "status": false };
//       if (dat.status) {
//         let app = await Token.where("userid", params.user).update(
//           "ratelimit",
//           limit,
//         );
//         let a = await PremiumApp(params.user);
//         if (a) {
//             response.body = dat;
//         } else {
//           response.status = 500;
//           response.body = {
//             status: "fail",
//             message: "unable to change limit",
//           };
//         }
//       } else {
//         response.status = 500;
//         response.body = {
//           status: "fail",
//           message: "unable to change limit",
//         };
//       }

//     } else {
//       response.status = 400;
//       response.body = { "err": "No Parameter for Userid or new limit" };
//     }
//   } catch (err) {
//     response.status = 500;
//     response.body = {
//       status: "fail",
//       message: err.toString(),
//     };
//   }
// }

// const addToken = async (
//   { params, response }: { params: { user: string }; response: any },
// ) => {
//   try {
//     if (params.user) {
//       let userid: bigint = BigInt(params.user);
//       let token = makeid(64);
//       let data = prisma.tokens.create({
//         data: {
//           userid: userid,
//           apikey: token,
//           totaluses: 0,
//           enhanced: false,
//           ratelimit: 60
//         }
//       })
//       let data = await Token.create({
//         userid: params.user,
//         apikey: token,
//         totaluses: 0,
//         enhanced: false,
//         ratelimit: 60
//       });
//       let resp = await axios.get(`addkey/${token}/${userid}`, config);
//       let dat = (resp.status === 200)
//         ? { "data": resp.data, "status": true }
//         : { "data": resp.data, "status": false };
//       response.body = dat;
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

// const deleteToken = async (
//   { params, response }: { params: { user: string }; response: any },
// ) => {
//   try {
//     if (params.user) {
//       let userid: bigint = BigInt(params.user);
//       let user = await Token.where("userid", params.user).all();

//       let token: string;
//       if (user[0].apikey) {
//         token = user[0].apikey.toString();
//       } else {
//         token = "error"
//       };
//       let data = await Token.where("apikey", token).delete();
//       let resp = await axios.get(`deletekey/${token}`, config);
//       let dat = (resp.status === 200)
//         ? { "data": resp.data, "status": true }
//         : { "data": resp.data, "status": false };
//       response.body = dat;
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

// const updateToken = async (
//   { params, response }: { params: { user: string }; response: any },
// ) => {
//   try {
//     if (params.user) {
//       let userid: bigint = BigInt(params.user);
//       let token = makeid(64);
//       let data = await Token.where("userid", params.user).update(
//         "apikey",
//         token,
//       );
//       let resp = await axios.get(`resetkey/${token}/${userid}`, config);
//       let dat = (resp.status === 200)
//         ? { "data": resp.data, "status": true }
//         : { "data": resp.data, "status": false };
//       response.body = dat;
//     } else {
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
