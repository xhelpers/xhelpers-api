import * as Hapi from "@hapi/hapi";
import { IOptions } from "../config";
import { registerServerPrepare } from "./prepare-server";
import { registerAuthJwt } from "./auth-jwt";
import { registerAuthAppKey } from "./auth-appkey";
import { registerAuthSso } from "./auth-sso";
import { registerLoadRoutes } from "./load-routes";
import { registerCronJobs } from "./cron-jobs";
import { registerHealthCheck } from "./healtcheck";
import { registerSwagger } from "./docs-swagger";
import { registerSentry } from "./logs-sentry";
import { registerExternalPlugins } from "./external-plugins";
import { registerDisplayRoutes } from "./display-routes";
import { registerRequireSsl } from "./require-ssl";

import { connect as connectMongoose } from "../database/db-mongoose";
import { connect as connectSequelize } from "../database/db-sequelize";

export default async function configurePlugins(
  server: Hapi.Server,
  options: IOptions
) {
  // call server prepare before start to load
  await registerServerPrepare(server, options);

  // try to setup a db connection
  server.app = {
    // Mongoose connect
    mongooseContext: await connectMongoose(options.mongooseOptions),
    // Sequelize connect
    sequelizeContext: await connectSequelize(options.sequelizeOptions),
  };

  // swagger
  await registerSwagger(server, options);

  // register ssl
  await registerRequireSsl(server, options);

  // Auth sso
  await registerAuthSso(server, options);

  // Auth jwt
  await registerAuthJwt(server, options);

  // Auth app key
  await registerAuthAppKey(server, options);

  // load default route files
  await registerLoadRoutes(server, options);

  // add default health check
  await registerHealthCheck(server, options);

  // register plugins
  await registerExternalPlugins(server, options);

  // register default cron job
  await registerCronJobs(server, options);

  // Sentry
  await registerSentry(server, options);

  // display routes on startup
  await registerDisplayRoutes(server, options);
}
