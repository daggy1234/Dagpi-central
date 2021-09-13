import { db } from "../db";
import { http } from "../http";

interface makePremiumResponse {
  status: boolean;
  msg: string;
}

export default async function makePremium(
  user_id: bigint,
  ratelimit: number
): Promise<makePremiumResponse> {
  const token = await db.db().tokens.findUnique({
    where: {
      userid: user_id,
    },
  });
  console.log(token);
  if (token) {
    console.log(`changelimits/${token.apikey}/${ratelimit}`);
    const resp = await http
      .client()
      .get(`changelimits/${token.apikey}/${ratelimit}`);
    const dat =
      resp.status === 200
        ? { data: resp.data, status: true }
        : { data: resp.data, status: false };
    console.log(dat);
    if (dat.status) {
      await db.db().tokens.update({
        data: {
          ratelimit: ratelimit,
        },
        where: {
          userid: user_id,
        },
      });
      await db.db().application.update({
        data: {
          premium: true,
        },
        where: {
          appuserid: user_id,
        },
      });
      return {
        status: true,
        msg: "",
      };
    } else {
      return {
        status: false,
        msg: "error updating main api with new limit",
      };
    }
  } else {
    return {
      status: false,
      msg: "No token found for user",
    };
  }
}
