import { DataTypes, Model } from "https://deno.land/x/denodb/mod.ts";

class Token extends Model {
  static table = "tokens";

  static timestamps = true;

  static fields = {
    userid: {
      type: DataTypes.BIG_INTEGER,
      allowNull: false,
      //primaryKey: true
    },
    apikey: {
      type: DataTypes.STRING,
      length: 64,
      allowNull: false,
      //unique: true,
    },
    totaluses: {
      type: DataTypes.INTEGER,
    },
    enhanced: {
      type: DataTypes.BOOLEAN,
    },
  };

}



export default Token;
