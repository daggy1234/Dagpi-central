import makeid from "../..//utils/token-gen.ts";
import { Token } from "../../db/postgres.ts";
import { Model, soxa } from "../../deps.ts";
import {PremiumApp} from "../app/index.ts"

let config = {
  baseURL: "https://api.dagpi.xyz/auth/",
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    "User-Agent": "Dagpi-Central",
    "Authorization": Deno.env.get("TOKEN"),
  },
};

const Tokens = async ({ response }: { response: any }) => {
  let data = await Token.all();
  response.body = { "Tokens": data };
};

const getToken = async (
  { params, response }: { params: { user: string }; response: any },
) => {
  if (params.user) {
    let userid: bigint = BigInt(params.user);
    let data = await Token.where("userid", params.user).get();
    response.body = { "data": data };
  } else {
    response.status = 400;
    response.body = { "err": "No Parameter for Userid" };
  }
};

const updateLimit = async (
  { params, response }: { params: { user: string, limit: string }; response: any },
) => {
  try {
    if (params.user && params.limit) {
      let limit = +params.limit;
      let userid: bigint = BigInt(params.user);
      let user = await Token.where("userid", params.user).all();
      let token:string;
      if (user[0].apikey) {
        token = user[0].apikey.toString();
      } else {
        token= "penis";
      };
      
      let resp = await soxa.get(`changelimits/${token}/${params.limit}`, config);
      let dat = (resp.status === 200)
        ? { "data": resp.data, "status": true }
        : { "data": resp.data, "status": false };
      if (dat.status) {
        let app = await Token.where("userid", params.user).update(
          "ratelimit",
          limit,
        );
        let a = await PremiumApp(params.user);
        if (a) {
            response.body = dat;
        } else {
          response.status = 500;
          response.body = {
            status: "fail",
            message: "unable to change limit",
          };
        }
      } else {
        response.status = 500;
        response.body = {
          status: "fail",
          message: "unable to change limit",
        };
      }
      
    } else {
      response.status = 400;
      response.body = { "err": "No Parameter for Userid or new limit" };
    }
  } catch (err) {
    response.status = 500;
    response.body = {
      status: "fail",
      message: err.toString(),
    };
  }
}

const addToken = async (
  { params, response }: { params: { user: string }; response: any },
) => {
  try {
    if (params.user) {
      let userid: bigint = BigInt(params.user);
      let token = makeid(64);
      let data = await Token.create({
        userid: params.user,
        apikey: token,
        totaluses: 0,
        enhanced: false,
        ratelimit: 60
      });
      let resp = await soxa.get(`addkey/${token}/${userid}`, config);
      let dat = (resp.status === 200)
        ? { "data": resp.data, "status": true }
        : { "data": resp.data, "status": false };
      response.body = dat;
    } else {
      response.status = 400;
      response.body = { "err": "No Parameter for Userid" };
    }
  } catch (err) {
    response.status = 500;
    response.body = {
      status: "fail",
      message: err.toString(),
    };
  }
};

const deleteToken = async (
  { params, response }: { params: { user: string }; response: any },
) => {
  try {
    if (params.user) {
      let userid: bigint = BigInt(params.user);
      let user = await Token.where("userid", params.user).all();
      
      let token: string; 
      if (user[0].apikey) {
        token = user[0].apikey.toString();
      } else {
        token = "error"
      };
      let data = await Token.where("apikey", token).delete();
      let resp = await soxa.get(`deletekey/${token}`, config);
      let dat = (resp.status === 200)
        ? { "data": resp.data, "status": true }
        : { "data": resp.data, "status": false };
      response.body = dat;
    } else {
      response.status = 400;
      response.body = { "err": "No Parameter for Userid" };
    }
  } catch (err) {
    response.status = 500;
    response.body = {
      status: "fail",
      message: err.toString(),
    };
  }
};

const updateToken = async (
  { params, response }: { params: { user: string }; response: any },
) => {
  try {
    if (params.user) {
      let userid: bigint = BigInt(params.user);
      let token = makeid(64);
      let data = await Token.where("userid", params.user).update(
        "apikey",
        token,
      );
      let resp = await soxa.get(`resetkey/${token}/${userid}`, config);
      let dat = (resp.status === 200)
        ? { "data": resp.data, "status": true }
        : { "data": resp.data, "status": false };
      response.body = dat;
    } else {
      response.body = { "err": "No Parameter for Userid" };
    }
  } catch (err) {
    response.status = 500;
    response.body = {
      status: "fail",
      message: err.toString(),
    };
  }
};
export { addToken, deleteToken, getToken, Tokens, updateToken, updateLimit };
