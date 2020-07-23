import * as Boom from "@hapi/boom";
import * as Hapi from "@hapi/hapi";
import * as HapiSwagger from "hapi-swagger";
import * as Vision from "@hapi/vision";

// database connectors
import {
  connect as connectMongoose,
  options as mongooseOptions,
} from "./db-mongoose";
import {
  connect as connectSequelize,
  options as sequelizeOptions,
} from "./db-sequelize";
import { useAuthFacebook, useAuthGitHub, useAuthGoogle } from "./sso-strategy";

const Inert = require("@hapi/inert");
const laabr = require("laabr");

export let currentOptions = {
  jwt_enabled: false,
  appkey_enabled: false,
};

export interface swaggerOptions {
  info: {
    title: string;
    version: string;
    contact?: {
      name: string;
      email: string;
    };
  };
  grouping?: string;
  tags?: Array<any>;
  [key: string]: any;
}

export interface serverOptions {
  port?: number | string;
  host?: string;
  [key: string]: any;
}

export interface options {
  swaggerOptions?: swaggerOptions;
  routeOptions?: {
    routes: string;
  };
  app_key_auth?: string;
  jwt_secret?: string;
  mongooseOptions?: mongooseOptions;
  sequelizeOptions?: sequelizeOptions;
  enableSSL?: boolean;
  enableSSO?: boolean;
  ssoCallback?: Function;
}

export interface createServerOptions {
  serverOptions: serverOptions;
  options: options;
}

export const createServer = async ({
  serverOptions,
  options,
}: createServerOptions) => {
  const envIsNotTest = process.env.NODE_ENV !== "TEST";

  if (envIsNotTest) console.log("Starting Xhelpers Hapi server API");

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
    enableSSL: options.enableSSL || process.env.SSL === "true",
    enableSSO: options.enableSSO || false,
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

  currentOptions = {
    jwt_enabled: !!defaultOptions.jwt_secret,
    appkey_enabled: !!defaultOptions.app_key_auth,
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

  server.app = {
    // Mongoose connect
    mongooseContext: await connectMongoose(defaultOptions.mongooseOptions),
    // Sequelize connect
    sequelizeContext: await connectSequelize(defaultOptions.sequelizeOptions),
  };

  // Redirect to SSL
  if (defaultOptions.enableSSL) {
    if (envIsNotTest) console.log("Settings API: SSL enabled;");
    await server.register({ plugin: require("hapi-require-https") });
  } else {
    if (envIsNotTest) console.log("Settings API: SSL disabled;");
  }

  // AppKey Secret
  if (!currentOptions.appkey_enabled) {
    if (envIsNotTest) console.log("Settings API: AppKey disabled;");
  } else {
    if (envIsNotTest) console.log("Settings API: AppKey enabled;");
    server.auth.scheme("appkey", (server: any, options: any) => {
      return {
        authenticate: (req, resp) => {
          const { appkey } = req.headers;
          if (!appkey)
            return Boom.unauthorized(
              "Header has to include 'appkey' key with value of the application key."
            );
          if (appkey !== defaultOptions.app_key_auth)
            return Boom.unauthorized();
          return resp.continue;
        },
      };
    });
    server.auth.strategy("appkey", "appkey");
  }

  // JWT Secret
  if (!currentOptions.jwt_enabled) {
    if (envIsNotTest) console.log("Settings API: JWT disabled;");
  } else {
    if (envIsNotTest) console.log("Settings API: JWT enabled;");

    // Hapi JWT auth
    await server.register(require("hapi-auth-jwt2"));
    server.auth.strategy("jwt", "jwt", {
      key: defaultOptions.jwt_secret,
      validate: validateFunc,
      verifyOptions: { algorithms: ["HS256"] },
    });
  }

  if (currentOptions.jwt_enabled || currentOptions.appkey_enabled) {
    if (!currentOptions.jwt_enabled) {
      server.auth.default("appkey");
    } else {
      server.auth.default("jwt");
    }
  }

  // SSO
  if (defaultOptions.enableSSO) {
    if (envIsNotTest) console.log("Settings API: SSO enabled;");
    await server.register(require("@hapi/bell"));
    await useAuthGitHub(server, defaultOptions.ssoCallback);
    await useAuthFacebook(server, defaultOptions.ssoCallback);
    await useAuthGoogle(server, defaultOptions.ssoCallback);
  } else {
    if (envIsNotTest) console.log("Settings API: SSO disabled;");
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
};

const validateFunc = async (decoded: any) => {
  return {
    isValid: true,
    credentials: decoded,
  };
};
