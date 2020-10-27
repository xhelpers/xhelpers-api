import { Sequelize, SequelizeOptions } from "sequelize-typescript";
import { ConnectionString } from "connection-string";

// @ts-ignore
import mysql2 from "mysql2";

export interface options extends SequelizeOptions {
  [key: string]: any;
}

export const db: any = {};
export const connect = async (sequelizeOptions?: options) => {
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
      ...sequelizeOptions.dialectOptions
    },
  };
  const connectionString = new ConnectionString(sequelizeOptions.host);

  try {
    const sequelize = new Sequelize(options);
    db.sequelize = sequelize;
    db.Sequelize = Sequelize;

    return await new Promise((res) => {
      return res(sequelize);
    }).then(
      async () => {
        const dbVersion = await sequelize.databaseVersion();
        console.log(
          `🆙  Connected to Sequelize: ${dbVersion}/${connectionString.protocol}://${connectionString.user}:xxxxx@${connectionString.host}`
        );
      },
      async (err) => {
        const dbVersion = await sequelize.databaseVersion();
        console.error(
          `📴 Failed to connect on Sequelize: ${dbVersion}/${connectionString.protocol}://${connectionString.user}:xxxxx@${connectionString.host}\nErr: ${err}`
        );
        setTimeout(async () => {
          await connect(sequelizeOptions);
        }, 5000);
      }
    );
  } catch (err) {
    console.error(
      `📴 Failed to connect on Sequelize: ${connectionString.protocol}://${connectionString.user}:xxxxx@${connectionString.host}\nErr: ${err}`
    );
    setTimeout(async () => {
      await connect(sequelizeOptions);
    }, 5000);
  }
  return null;
};
