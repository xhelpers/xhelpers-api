import * as Boom from "boom";
import * as Hapi from "hapi";

import { useAuthFacebook, useAuthGitHub, useAuthGoogle } from "./sso-strategy";

// Connect to database
import connectMongoose from "./db-mongoose";
import connectSequelize from "./db-sequelize";

export default async function createServer({
  serverOptions,
  options
}: {
  serverOptions: {
    port: number;
    host: string;
  };
  options: {
    swaggerOptions?: any;
    routeOptions: {
      dir: string;
      prefix?: string;
    };
    jwt_secret?: string;
    mongooseOptions?: any;
    sequelizeOptions?: any;
    enableSSL: boolean;
    enableSSO: boolean;
    ssoCallback: Function;
  };
}) {
  console.log("Starting Xhelpers Hapi server API");

  const defaultServerOptions = {
    port: Number(process.env.PORT || 80),
    host: process.env.HOST || "127.0.0.1",
    ...serverOptions
  };

  const defaultOptions = {
    swaggerOptions: {
      jsonPath: "/api/documentation/swagger.json",
      documentationPath: "/api/documentation",
      swaggerUIPath: "/api/swaggerui/",
      info: {
        title: "API",
        version: "1.0"
      },
      grouping: "tags",
      tags: []
    },
    jwt_secret: process.env.JWT_SECRET,
    routeOptions: {
      dir: `${__dirname}/routes/**`,
      prefix: "/api"
    },
    enableSSL: process.env.SSL === "true",
    enableSSO: false,
    ssoCallback: (
      user: { email: any; name: any; avatar: any; token: string },
      userData: { userType: any; meta: any }
    ) => {},
    ...options
  };

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
      defaultServerOptions
    )
  );

  server.app = {
    // Mongoose connect
    mongooseContext: await connectMongoose(defaultOptions.mongooseOptions),
    // Sequelize connect
    sequelizeContext: await connectSequelize(defaultOptions.sequelizeOptions)
  };

  // Redirect to SSL
  if (defaultOptions.enableSSL) {
    console.log("Settings API: SSL enabled;");
    await server.register({ plugin: require("hapi-require-https") });
  } else {
    console.log("Settings API: SSL disabled;");
  }

  // SSO
  if (defaultOptions.enableSSO) {
    console.log("Settings API: SSO enabled;");
    await server.register(require("bell"));
    await useAuthGitHub(server, defaultOptions.ssoCallback);
    await useAuthFacebook(server, defaultOptions.ssoCallback);
    await useAuthGoogle(server, defaultOptions.ssoCallback);
  } else {
    console.log("Settings API: SSO disabled;");
  }

  // Hapi JWT auth
  if (defaultOptions.jwt_secret) {
    await server.register(require("hapi-auth-jwt2"));
    server.auth.strategy("jwt", "jwt", {
      key: defaultOptions.jwt_secret,
      validate: validateFunc,
      verifyOptions: { algorithms: ["HS256"] }
    });
    server.auth.default("jwt");
  }

  const routeOptions: any = {
    routes: {
      prefix: defaultOptions.routeOptions.prefix
    },
    ...defaultOptions.routeOptions
  };
  // Hapi plugins
  await server.register([
    require("vision"),
    require("inert"),
    {
      plugin: require("hapi-swagger"),
      options: defaultOptions.swaggerOptions
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

  server.events.on("start", () => {
    console.log("=".repeat(100));
    console.log(`🆙  Server running at: ${server.info.uri}/api/`);
    console.log(
      `🆙  Server docs running at: ${server.info.uri}/api/documentation`
    );
    console.log("=".repeat(100));

    console.log(`Routing table:`);
    server.table().forEach(route => {
      let iconRoute = "🚧";
      const ignoreInternalRoute = route.path.startsWith("/api/swaggerui");
      if (ignoreInternalRoute) return;
      switch (route.method) {
        case "get":
          iconRoute = "🔎 ";
          break;
        case "post":
          iconRoute = "📄 ";
          break;
        case "put":
          iconRoute = "📝 ";
          break;
        case "patch":
          iconRoute = "📝 ";
          break;
        case "delete":
          iconRoute = "🚩 ";
          break;
        default:
          break;
      }
      const requireAuth = !!route.settings.auth;
      console.log(
        `\t${iconRoute} ${route.method} - ${requireAuth ? "🔑 " : ""}\t${
          route.path
        }`
      );
    });
    console.log("=".repeat(100));
  });

  server.events.on("stop", () => {
    console.info("⛔️📴  Server Stoped");
  });

  return server;
}

const validateFunc = async (decoded: any) => {
  return {
    isValid: true,
    credentials: decoded
  };
};
