import { SequelizeOptions } from "sequelize-typescript";

export interface ISequelizeOptions extends SequelizeOptions {
  [key: string]: any;
}
