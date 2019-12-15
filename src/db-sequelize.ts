import { Sequelize, SequelizeOptions } from "sequelize-typescript";

// @ts-ignore
import mysql2 from "mysql2";

export const db: any = {};
export default async function connect(sequelizeOptions: SequelizeOptions) {
  if (!sequelizeOptions.host) {
    console.log("Settings API: Sequelize disabled;");
    return;
  }
  const options: SequelizeOptions = {
    dialect: "mysql",
    dialectModule: mysql2,
    repositoryMode: true,
    ...sequelizeOptions
  };

  try {
    const sequelize = new Sequelize(options);
    db.sequelize = sequelize;
    db.Sequelize = Sequelize;
    const dbVersion = await sequelize.databaseVersion();
    return await new Promise(res => {
      return res(sequelize);
    }).then(
      () => {
        console.log(
          `🆙  Connected to Sequelize: ${dbVersion}/${sequelizeOptions.host}`
        );
      },
      err => {
        console.error(
          `📴 Failed to connect on Sequelize: ${dbVersion}/${sequelizeOptions.host}\nErr: ${err}`
        );
        setTimeout(async () => {
          await connect(sequelizeOptions);
        }, 5000);
      }
    );
  } catch (err) {
    console.error(
      `📴 Failed to connect on Sequelize: ${sequelizeOptions.host}\nErr: ${err}`
    );
    setTimeout(async () => {
      await connect(sequelizeOptions);
    }, 5000);
  }
  return null;
}
