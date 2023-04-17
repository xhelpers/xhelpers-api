import { Sequelize, SequelizeOptions, Model } from "sequelize-typescript";
import * as SequelizeTypescript from "sequelize-typescript";
import { Op } from "sequelize";

// @ts-ignore
import mysql2 from "mysql2";
import { ISequelizeOptions } from "../config";

export const db: any = {};
export const connect = async (sequelizeOptions?: ISequelizeOptions) => {
  const envIsNotTest = process.env.NODE_ENV !== "TEST";

  if (!sequelizeOptions) {
    if (envIsNotTest) console.log("Settings API: Sequelize disabled;");
    return;
  }
  if (envIsNotTest) console.log("Settings API: Sequelize enabled;");
  const options: SequelizeOptions = {
    dialect: "mysql",
    dialectModule: mysql2,
    repositoryMode: true,
    ...sequelizeOptions,
    dialectOptions: {
      connectTimeout: 60000,
      ...sequelizeOptions.dialectOptions,
    },
  };

  try {
    const sequelize = new Sequelize(options);
    db.sequelize = sequelize;
    db.Sequelize = Sequelize;

    return await new Promise((res) => {
      return res(sequelize);
    }).then(
      async () => {
        const dbVersion = await sequelize.databaseVersion();
        console.log(`🆙  Connected to Sequelize: ${dbVersion}`);
      },
      async (err) => {
        handleFailedConnection(err);
      }
    );
  } catch (err) {
    handleFailedConnection(err);
  }
  return null;

  function handleFailedConnection(err: unknown) {
    console.error(`📴 Failed to connect on Sequelize: \nErr: ${err}`);
    setTimeout(async () => {
      await connect(sequelizeOptions);
    }, 5000);
  }
};

export { Sequelize, SequelizeOptions, Model, SequelizeTypescript, Op };
