import crytpo from "crypto";

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
  return crytpo.randomBytes(length).toString("hex");
}

function newToken(): string {
  return makeid(64);
}

export { makeid, csprng, newToken };
