import * as Boom from "boom";
import * as Hapi from "hapi";

import { useAuthFacebook, useAuthGitHub, useAuthGoogle } from "./sso-strategy";

// Connect to database
import connectMongodb from "./db-mongo";
import connectSequelize from "./db-sequelize";

export default async function createServer({
  serverOptions,
  options
}: {
  serverOptions: any;
  options: {
    enableSSL: boolean;
    swaggerOptions: any;
    routeOptions: any;
    jwt_secret: any;
    mongodb: {
      uri: string;
      connectionOptions: any;
    };
    sequelize: {
      sequelizeOptions: any;
    };
    enableSSO: boolean;
    ssoCallback: Function;
  };
}) {
  // Hapi server
  const server = new Hapi.Server(
    Object.assign(
      {
        port: 3000,
        host: "localhost",
        routes: {
          validate: {
            failAction: async (
              request: Hapi.Request,
              h: Hapi.RequestEventHandler,
              err: any
            ) => {
              if (process.env.NODE_ENV === "production") {
                // In prod, log a limited error message and throw the default Bad Request error.
                console.error("ValidationError:", err.message);
                throw Boom.badRequest(`Invalid request payload input`);
              } else {
                // During development, log and respond with the full error.
                console.error(err);
                throw err;
              }
            }
          },
          cors: {
            origin: ["*"]
          }
        }
      },
      serverOptions
    )
  );

  server.app = {
    // Mongodb connect
    mongooseContext: await connectMongodb(
      options.mongodb.uri,
      options.mongodb.connectionOptions
    ),
    // Sequelize connect
    sequelizeContext: await connectSequelize(options.sequelize.sequelizeOptions)
  };

  // Redirect to SSL
  if (options.enableSSL) {
    console.log("Settings API: SSL enabled;");
    await server.register({ plugin: require("hapi-require-https") });
  } else {
    console.log("Settings API: SSL disabled;");
  }

  // SSO
  if (options.enableSSO) {
    console.log("Settings API: SSO enabled;");
    await server.register(require("bell"));
    await useAuthGitHub(server, options.ssoCallback);
    await useAuthFacebook(server, options.ssoCallback);
    await useAuthGoogle(server, options.ssoCallback);
  } else {
    console.log("Settings API: SSO disabled;");
  }

  // Hapi JWT auth
  await server.register(require("hapi-auth-jwt2"));
  server.auth.strategy("jwt", "jwt", {
    key: options.jwt_secret,
    validate: validateFunc,
    verifyOptions: { algorithms: ["HS256"] }
  });
  server.auth.default("jwt");

  const routeOptions: any = {
    prefix: "/api",
    routes: {
      prefix: "/api"
    },
    ...options.routeOptions
  };
  // Hapi plugins
  await server.register([
    require("vision"),
    require("inert"),
    {
      plugin: require("hapi-swagger"),
      options: options.swaggerOptions
    },
    {
      plugin: require("hapi-routes"),
      options: routeOptions
    },
    {
      plugin: require("good"),
      options: {
        ops: {
          interval: 1000
        },
        reporters: {
          consoleReporter: [
            {
              module: "good-squeeze",
              name: "Squeeze",
              args: [{ response: "*" }]
            },
            {
              module: "good-console"
            },
            "stdout"
          ]
        }
      }
    }
  ]);

  return server;
}

const validateFunc = async (decoded: any) => {
  return {
    isValid: true,
    credentials: decoded
  };
};
