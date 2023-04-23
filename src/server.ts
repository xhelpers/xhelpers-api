import * as Boom from "@hapi/boom";
import * as Hapi from "@hapi/hapi";

import { ICreateServerOptions } from "./config";
import configurePlugins from "./plugins";
import { log, logger } from "./utils";

export const createServer = async ({
  serverOptions,
  options,
}: ICreateServerOptions) => {
  log("Starting Xhelpers Hapi server API");

  const defaultServerOptions: any = {
    port: Number(process.env.PORT || 80),
    host: process.env.HOST || "127.0.0.1",
    ...serverOptions,
  };

  const defaultOptions = {
    swaggerOptions: {
      info: {
        title: "API",
        version: "1.0",
        contact: {
          name: "",
          email: "",
        },
      },
      grouping: "tags",
      tags: [],
    },
    routeOptions: {
      routes: "**/routes/*.js",
    },
    plugins: options.plugins || [],
    enableSSL: options.enableSSL || process.env.SSL === "true",
    enableSSO: options.enableSSO || false,
    enableCronJobs: options.enableCronJobs || false,
    ssoCallback: (user: {
      email: string;
      name: string;
      avatar: any;
      token: string;
      userType: any;
      meta: any;
    }) => {
      return {
        url: "",
      };
    },
    ...options,
  };

  const serverOpts = {
    port: defaultServerOptions.port,
    host: defaultServerOptions.host,
    routes: {
      validate: {
        failAction: async (
          request: Hapi.Request,
          h: Hapi.RequestEventHandler,
          err: any
        ) => {
          if (process.env.NODE_ENV === "production") {
            logger("error", "🔥  Error:", err.message);
            throw Boom.badRequest(`Invalid request payload input`);
          } else {
            if (process.env.NODE_ENV === "DEV")
              logger("error", "🔥  Error:", err);
            if (Boom.isBoom(err)) return err;
            throw err;
          }
        },
      },
      cors: {
        origin: ["*"],
      },
    },
  };

  const mergedOpts: any = {
    ...serverOpts,
    ...defaultServerOptions,
    routes: {
      ...serverOpts.routes,
      ...defaultServerOptions.routes,
    },
  };

  // Hapi server
  const server = new Hapi.Server(mergedOpts);

  await configurePlugins(server, defaultOptions);

  server.events.on("stop", () => {
    log("⛔️  📴  Server Stoped");
  });
  return server;
};
