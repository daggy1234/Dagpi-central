function parse(json) {
  return JSON.parse(
    JSON.stringify(json, (_, v) => (typeof v === "bigint" ? v.toString() : v))
  );
}

export default parse;
