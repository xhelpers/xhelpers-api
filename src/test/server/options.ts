import { createServerOptions } from "../../server";

export const optionsJwtSecret: createServerOptions = {
  serverOptions: {
    port: process.env.PORT || 3100,
    host: process.env.HOST || "127.0.0.1",
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  },
  options: {
    jwt_secret: "secret",
    swaggerOptions: {
      info: {
        title: "pkgJson.name",
        version: "pkgJson.version",
      },
      schemes: [process.env.SSL === "true" ? "https" : "http"],
      grouping: "tags",
    },
    routeOptions: {
      routes: "*/routes/*.route.js",
    },
  },
};

export const optionsAppKey: createServerOptions = {
  serverOptions: {
    port: process.env.PORT || 3100,
    host: process.env.HOST || "127.0.0.1",
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  },
  options: {
    app_key_auth: "123",
    swaggerOptions: {
      info: {
        title: "pkgJson.name",
        version: "pkgJson.version",
      },
      schemes: [process.env.SSL === "true" ? "https" : "http"],
      grouping: "tags",
    },
    routeOptions: {
      routes: "*/routes/*.route.js",
    },
  },
};

export const optionsJwtSecretAndAppKey: createServerOptions = {
  serverOptions: {
    port: process.env.PORT || 3100,
    host: process.env.HOST || "127.0.0.1",
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  },
  options: {
    jwt_secret: "secret",
    app_key_auth: "123",
    swaggerOptions: {
      info: {
        title: "pkgJson.name",
        version: "pkgJson.version",
      },
      schemes: [process.env.SSL === "true" ? "https" : "http"],
      grouping: "tags",
    },
    routeOptions: {
      routes: "*/routes/*.route.js",
    },
  },
};
