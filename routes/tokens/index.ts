import makeid from "../..//utils/token-gen.ts";
import {Token} from "../../db/postgres.ts";
import { soxa } from 'https://deno.land/x/soxa/mod.ts'
import env from "../../utils/envs.ts";

let config = {
  baseURL: 'https://auth.dagpi.tk/',
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Authorization': env.token
  }
}


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

const addToken = async (
  { params, response }: { params: { user: string }; response: any },
) => {
  if (params.user) {
      let userid: bigint = BigInt(params.user);
      let token = makeid(64);
      let data = await Token.create({
          userid: params.user,
          apikey: token,
          totaluses: 0,
          enhanced: false,
      });
      let resp  = await soxa.get(`addkey/${token}/${userid}`,config)
      let dat = (resp.status === 200 ) ? { "data": resp.data,"status": true } : { "data": resp.data,"status": false };
      response.body = dat;
    
      
    
  } else {
    response.status = 400;
    response.body = { "err": "No Parameter for Userid" };
  }
};

const deleteToken = async (
  { params, response }: { params: { user: string }; response: any },
) => {
  if (params.user) {
      let userid: bigint = BigInt(params.user);
      let user = await Token.where("userid",params.user).get();
      let token = user.apikey;
      let data = await Token.where("userid", params.user).delete();
      let resp  = await soxa.get(`/deletekey/${token}`,config)
      let dat = (resp.status === 200 ) ? { "data": resp.data,"status": true } : { "data": resp.data,"status": false }
      response.body = dat;
      
      
  } else {
    response.status = 400
    response.body = { "err": "No Parameter for Userid" };
  }
};

const updateToken = async (
  { params, response }: { params: { user: string }; response: any },
) => {
  if (params.user) {
      let userid: bigint = BigInt(params.user);
      let token = makeid(64);
      let data = await Token.where("userid", params.user).update(
        "apikey",
        token,
      );
      let resp  = await soxa.get(`/resetkey/${token}/${userid}`,config)
      let dat = (resp.status === 200 ) ? { "data": resp.data,"status": true } : { "data": resp.data,"status": false }
      response.body = dat;
      
    
  } else {
    response.body = { "err": "No Parameter for Userid" };
  }
};
export { Tokens, getToken, addToken, deleteToken, updateToken };
