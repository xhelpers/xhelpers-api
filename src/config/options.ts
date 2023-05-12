import * as Hapi from "@hapi/hapi";

import {
  IMongooseOptions,
  IRouteOptions,
  ISentryOptions,
  ISequelizeOptions,
  ISwaggerOptions,
} from "./";

export interface IOptions {
  swaggerOptions?: ISwaggerOptions;
  routeOptions?: IRouteOptions;
  plugins?: [];
  app_key_auth?: string;
  jwt_secret?: string;
  mongooseOptions?: IMongooseOptions;
  sequelizeOptions?: ISequelizeOptions;
  sentryOptions?: ISentryOptions;
  enableSSL?: boolean;
  enableSSO?: boolean;
  enableCronJobs?: boolean;
  ssoCallback?: Function;
  prepareServer?: (server: Hapi.Server) => void;
}
