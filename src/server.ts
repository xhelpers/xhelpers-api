import * as Boom from "boom";
import * as Hapi from "@hapi/hapi";
import * as HapiSwagger from "hapi-swagger";
import * as Vision from "@hapi/vision";

import { useAuthFacebook, useAuthGitHub, useAuthGoogle } from "./sso-strategy";

// Connect to database
import connectMongoose from "./db-mongoose";
import connectSequelize from "./db-sequelize";

const Inert = require("@hapi/inert");
const laabr = require("laabr");

export async function createServer({
  serverOptions,
  options,
}: {
  serverOptions: {
    port: number;
    host: string;
  };
  options: {
    swaggerOptions?: any;
    routeOptions: {
      routes: string;
    };
    jwt_secret?: string;
    mongooseOptions?: any;
    sequelizeOptions?: any;
    enableSSL: boolean;
    enableSSO: boolean;
    ssoCallback: Function;
  };
}) {
  const envIsNotTest = process.env.NODE_ENV !== "TEST";

  if (envIsNotTest) console.log("Starting Xhelpers Hapi server API");

  const defaultServerOptions = {
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
    jwt_secret: process.env.JWT_SECRET,
    routeOptions: {
      routes: "**/routes/*.js",
    },
    enableSSL: process.env.SSL === "true",
    enableSSO: false,
    ssoCallback: (
      user: { email: any; name: any; avatar: any; token: string },
      userData: { userType: any; meta: any }
    ) => {},
    ...options,
  };

  // Hapi server
  const server = new Hapi.Server(
    Object.assign(
      {
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
                console.error("🔥  Error:", err.message);
                throw Boom.badRequest(`Invalid request payload input`);
              } else {
                if (process.env.NODE_ENV === "DEV")
                  console.error("🔥  Error:", err);
                if (Boom.isBoom(err)) return err;
                throw err;
              }
            },
          },
          cors: {
            origin: ["*"],
          },
        },
      },
      defaultServerOptions
    )
  );

  server.app = {
    // Mongoose connect
    mongooseContext: await connectMongoose(defaultOptions.mongooseOptions),
    // Sequelize connect
    sequelizeContext: await connectSequelize(defaultOptions.sequelizeOptions),
  };

  // JWT Secret
  if (!defaultOptions.jwt_secret) {
    if (envIsNotTest) console.log("Settings API: JWT disabled;");
  } else {
    if (envIsNotTest) console.log("Settings API: JWT enabled;");
  }

  // Redirect to SSL
  if (defaultOptions.enableSSL) {
    if (envIsNotTest) console.log("Settings API: SSL enabled;");
    await server.register({ plugin: require("hapi-require-https") });
  } else {
    if (envIsNotTest) console.log("Settings API: SSL disabled;");
  }

  // SSO
  if (defaultOptions.enableSSO) {
    if (envIsNotTest) console.log("Settings API: SSO enabled;");
    await server.register(require("bell"));
    await useAuthGitHub(server, defaultOptions.ssoCallback);
    await useAuthFacebook(server, defaultOptions.ssoCallback);
    await useAuthGoogle(server, defaultOptions.ssoCallback);
  } else {
    if (envIsNotTest) console.log("Settings API: SSO disabled;");
  }

  // Hapi JWT auth
  if (defaultOptions.jwt_secret) {
    await server.register(require("hapi-auth-jwt2"));
    server.auth.strategy("jwt", "jwt", {
      key: defaultOptions.jwt_secret,
      validate: validateFunc,
      verifyOptions: { algorithms: ["HS256"] },
    });
    server.auth.default("jwt");
  }

  const routeOptions: any = {
    ...defaultOptions.routeOptions,
  };
  // Hapi plugins
  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: defaultOptions.swaggerOptions,
    },
    {
      plugin: require("hapi-router"),
      options: routeOptions,
    },
    {
      plugin: require("hapi-dev-errors"),
      options: {
        showErrors: process.env.NODE_ENV !== "production",
      },
    },
    {
      plugin: require("hapijs-status-monitor"),
      options: {
        title: `${defaultOptions.swaggerOptions.info.title} - Status Monitor`,
        routeConfig: {
          auth: false,
        },
      },
    },
    {
      plugin: laabr,
      options: {
        colored: true,
        formats: {
          response:
            "[:time[iso]] :method :url :status (:responseTime ms) :payload",
        },
        hapiPino: {
          logPayload: true,
          mergeHapiLogData: true,
        },
      },
    },
  ]);

  server.route({
    method: "GET",
    path: "/health",
    options: {
      tags: ["api", "health"],
      description: "Check if server is up",
      auth: false,
    },
    handler: (request, h) => {
      return {
        status: "Server running",
        code: 200,
      };
    },
  });

  if (envIsNotTest) {
    server.events.on("start", () => {
      console.log("=".repeat(100));
      console.log(`🆙  Server api    : ${server.info.uri}/`);
      console.log(`🆙  Server doc    : ${server.info.uri}/documentation`);
      console.log(`🆙  Server status : ${server.info.uri}/status`);
      console.log("=".repeat(100));

      console.log(`Routing table:`);
      server.table().forEach((route) => {
        let iconRoute = "🚧";
        const ignoreInternalRoute = route.path.includes("swaggerui");
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
  }

  server.events.on("stop", () => {
    if (process.env.NODE_ENV !== "TEST") {
      console.info("⛔️  📴  Server Stoped");
    }
  });

  return server;
}

const validateFunc = async (decoded: any) => {
  return {
    isValid: true,
    credentials: decoded,
  };
};
