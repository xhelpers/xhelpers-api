import { Sequelize, SequelizeOptions } from "sequelize-typescript";

import mysql2 from "mysql2";

const fs = require("fs");
const path = require("path");
export const db: any = {};

export default async function connect() {
  const mysqlUri = process.env.MYSQLDB_HOST;
  if (!mysqlUri) {
    console.log("Settings API: MySQL disabled;");
    return;
  }
  const options: SequelizeOptions = {
    host: mysqlUri,
    database: process.env.MYSQLDB_DATABASE,
    username: process.env.MYSQLDB_USER,
    password: process.env.MYSQLDB_PASSWORD,
    storage: process.env.MYSQLDB_STORAGE,
    dialect: "mysql",
    dialectModule: mysql2,
    models: [__dirname + "/../model/**"],
    repositoryMode: true
  };

  try {
    const sequelize = new Sequelize(options);
    console.log("sequelize before");

    db.sequelize = sequelize;
    db.Sequelize = Sequelize;

    const dbVersion = await sequelize.databaseVersion();
    console.log("sequelize before");
    return await new Promise(res => {
      return res(sequelize);
    }).then(
      () => {
        console.log(`🆙  Connected to mysql: ${dbVersion}/${mysqlUri}`);
      },
      err => {
        console.error(
          `📴 Failed to connect on mysql: ${dbVersion}/${mysqlUri}\nErr: ${err}`
        );
        setTimeout(async () => {
          await connect();
        }, 5000);
      }
    );
  } catch (err) {
    console.error(`📴 Failed to connect on mysql: ${mysqlUri}\nErr: ${err}`);
    setTimeout(async () => {
      await connect();
    }, 5000);
  }
  return null;
}
