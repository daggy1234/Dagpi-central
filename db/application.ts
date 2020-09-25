import { DataTypes, Model } from "../deps.ts";

class Application extends Model {
    static table = "application";
    static timestamps = true;

    static fields= {
        uu: {
        //primaryKey: true,
        type: DataTypes.UUID,
        allowNull: false,
        },
        appname: {
            allowNull:false,
            type:DataTypes.STRING
        },
        appdescription: {
            allowNull:false,
            type: DataTypes.STRING
        },
        appurl: {
            allowNull: false,
            type: DataTypes.STRING
        },
        appuserid: {
            allowNull: false,
            type: DataTypes.BIG_INTEGER,
            //unique: true,
        }
    }
}

export default Application;