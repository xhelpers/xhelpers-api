import * as Hapi from "@hapi/hapi";
import { IOptions } from "../config";
import { registerServerPrepare } from "../plugins/prepare-server";
import { registerAuthJwt } from "../plugins/auth-jwt";
import { registerAuthAppKey } from "../plugins/auth-appkey";
import { registerAuthSso } from "../plugins/auth-sso";
import { registerLoadRoutes } from "../plugins/load-routes";
import { registerCronJobs } from "../plugins/cron-jobs";
import { registerHealthCheck } from "../plugins/healtcheck";
import { registerSwagger } from "../plugins/docs-swagger";
import { registerSentry } from "../plugins/logs-sentry";
import { registerExternalPlugins } from "../plugins/external-plugins";
import { registerDisplayRoutes } from "../plugins/display-routes";
import { registerRequireSsl } from "../plugins/require-ssl";

import { connect as connectMongoose } from "../database/db-mongoose";
import { connect as connectSequelize } from "../database/db-sequelize";

export default async function configureMiddlewares(
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

  // Sentry
  await registerSentry(server, options);

  // Auth app key
  await registerAuthAppKey(server, options);

  // Auth jwt
  await registerAuthJwt(server, options);

  // Auth sso
  await registerAuthSso(server, options);

  // Auth app key
  await registerAuthAppKey(server, options);

  // load default route files
  await registerLoadRoutes(server, options);

  // register default cron job
  await registerCronJobs(server, options);

  // add default health check
  await registerHealthCheck(server, options);

  // register plugins
  await registerExternalPlugins(server, options);

  // display routes on startup
  await registerDisplayRoutes(server, options);
}
