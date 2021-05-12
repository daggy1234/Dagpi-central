import crypto from "crypto";

function makeid(length: number) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function csprng(length: number): string {
  return crypto.randomBytes(length).toString("hex");
}

function btoa(toEncode: string): string {
  return Buffer.from(toEncode)
    .toString("base64")
    .replace("=", "")
    .replace("=", "");
}

function newToken(client_id: string): string {
  const date = btoa(Math.round(new Date().valueOf() / 1000).toString());
  const secret = crypto.randomBytes(8).toString("hex");
  return `${date}.${client_id}.${secret}`;
}

export { makeid, csprng, newToken };
