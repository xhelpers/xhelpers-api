import { createServerOptions } from "../../server";
import { Server } from "@hapi/hapi";

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
      schemes: ["http"],
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
      schemes: ["http"],
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
      schemes: ["http"],
      grouping: "tags",
    },
    routeOptions: {
      routes: "*/routes/*.route.js",
    },
  },
};

export const optionsWithSSL: createServerOptions = {
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
    swaggerOptions: {
      info: {
        title: "pkgJson.name",
        version: "pkgJson.version",
      },
      schemes: ["https"],
      grouping: "tags",
    },
    routeOptions: {
      routes: "*/routes/*.route.js",
    },
  },
};

export const optionsWithoutSSL: createServerOptions = {
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
    swaggerOptions: {
      info: {
        title: "pkgJson.name",
        version: "pkgJson.version",
      },
      schemes: ["https"],
      grouping: "tags",
    },
    routeOptions: {
      routes: "*/routes/*.route.js",
    },
  },
};

export const optionsWithPrepareServer: createServerOptions = {
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
    swaggerOptions: {
      info: {
        title: "pkgJson.name",
        version: "pkgJson.version",
      },
      schemes: ["https"],
      grouping: "tags",
    },
    routeOptions: {
      routes: "*/routes/*.route.js",
    },
    prepareServer: (server: Server) => {
      server.auth.scheme("test", (server: any, options: any) => {
        return {
          authenticate: async (req, h) => {
            const credentials = { user: { name: "kiko" } };
            return h.authenticated({ credentials, artifacts: {} });
          },
        };
      });
      server.auth.strategy("test", "test");
      server.auth.default("test");
    },
  },
};

export const optionsWithInvalidPrepareServer: createServerOptions = {
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
    swaggerOptions: {
      info: {
        title: "pkgJson.name",
        version: "pkgJson.version",
      },
      schemes: ["https"],
      grouping: "tags",
    },
    routeOptions: {
      routes: "*/routes/*.route.js",
    },
    prepareServer: (server: Server) => {
      server.auth.strategy("test", "test");
    },
  },
};

export const optionsWithOverridePlugin: createServerOptions = {
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
    swaggerOptions: {
      info: {
        title: "pkgJson.name",
        version: "pkgJson.version",
      },
      schemes: ["https"],
      grouping: "tags",
    },
    routeOptions: {
      routes: "*/routes/*.route.js",
    },
    plugins: [],
  },
};
