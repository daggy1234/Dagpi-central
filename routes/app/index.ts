import { Application } from "../../db/postgres.ts";
import { v4 } from "../../deps.ts";

const Apps = async ({ response }: { response: any }) => {
  let data = await Application.all();
  response.body = { "Apps": data };
};

const AddApp = async (
  { request , response }: {request:any,response:any}
) => {
    if (!request.hasBody) { 
        response.status = 400;
        response.body = {msg: "There is no form body"};
        return;
    }
    try{
        // let body = await request.body().value;
        // console.log(body);
    const {name,description,url,user} = await request.body().value;
    const app = await Application.create({
        uu: v4.generate(),
        appname: name,
        appurl: url,
        appdescription: description,
        appuserid: +user,
        approved: false
    })
    response.body = {app: app};
    //console.log(name,description);
    //response.body = {data: name};
    return;
    } catch (err) {
        console.log(err);
    };
};

const GetApp = async (
    { params, response }: { params: { user: string }; response: any },
  ) => {
    if (params.user) {
        const userid = +params.user;
        let data = await Application.where("appuserid", userid).get();
        response.body = { "data": data };
    } else {
        response.status = 400
        response.body = { "err": "No Parameter for Userid" };
      }

  };

const DeleteApp = async (
    { params, response }: { params: { user: string }; response: any },
  ) => {
    if (params.user) {
        const userid = +params.user;
        let data = await Application.where("appuserid", userid).delete();
        response.body = { "data": "Deleted" };
    } else {
        response.status = 400
        response.body = { "err": "No Parameter for Userid" };
      }

  };
export {Apps,AddApp,GetApp,DeleteApp};