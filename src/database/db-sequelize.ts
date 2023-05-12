import { Sequelize, SequelizeOptions, Model } from "sequelize-typescript";
import * as SequelizeTypescript from "sequelize-typescript";
import { Op } from "sequelize";
import { log, logger } from "../utils";

// @ts-ignore
import mysql2 from "mysql2";
import { ISequelizeOptions } from "../config";

export const db: any = {};
export const connect = async (sequelizeOptions?: ISequelizeOptions) => {
  if (!sequelizeOptions) {
    log("Settings API: Sequelize disabled;");
    return;
  }
  log("Settings API: Sequelize enabled;");
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
        log(`🆙  Connected to Sequelize: ${dbVersion}`);
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
    logger("error", "📴 Failed to connect on Sequelize:", err);
    setTimeout(async () => {
      await connect(sequelizeOptions);
    }, 5000);
  }
};

const getRepository = (model: Model) => db.sequelize.getRepository(model);

export {
  Sequelize,
  SequelizeOptions,
  Model,
  SequelizeTypescript,
  Op,
  getRepository,
};
