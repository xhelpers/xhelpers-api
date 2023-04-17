import { IOptions } from "./options";
import { IServerOptions, ICreateServerOptions, IRouteOptions } from "./server";
import { IMongooseOptions } from "./mongoose";
import { ISequelizeOptions } from "./sequelize";
import { ISentryOptions } from "./sentry";
import { ISwaggerOptions } from "./swagger";
import { ICronJob } from "./cronjobs";

// internal tests must ignore some logs
const envIsNotTest = process.env.NODE_ENV !== "TEST";

export {
  IOptions,
  IServerOptions,
  ICreateServerOptions,
  IRouteOptions,
  IMongooseOptions,
  ISequelizeOptions,
  ISwaggerOptions,
  ISentryOptions,
  envIsNotTest,
  ICronJob,
};
