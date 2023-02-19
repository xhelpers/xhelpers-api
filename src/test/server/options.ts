import { createServerOptions } from "../../server";
import { Server } from "@hapi/hapi";

const srvConsts = {
  port: process.env.PORT || 3100,
  host: process.env.HOST || "127.0.0.1",
  routes: {
    cors: {
      origin: ["*"],
    },
  },
};

const optConsts = {
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
};

export const optionsJwtSecret: createServerOptions = {
  serverOptions: {
    ...srvConsts,
  },
  options: {
    jwt_secret: "secret",
    ...optConsts,
  },
};

export const optionsAppKey: createServerOptions = {
  serverOptions: {
    ...srvConsts,
  },
  options: {
    app_key_auth: "123",
    ...optConsts,
  },
};

export const optionsJwtSecretAndAppKey: createServerOptions = {
  serverOptions: {
    ...srvConsts,
  },
  options: {
    jwt_secret: "secret",
    app_key_auth: "123",
    ...optConsts,
  },
};

export const optionsWithSSL: createServerOptions = {
  serverOptions: {
    ...srvConsts,
  },
  options: {
    ...optConsts,
    enableSSL: true,
  },
};

export const optionsWithoutSSL: createServerOptions = {
  serverOptions: {
    ...srvConsts,
  },
  options: {
    ...optConsts,
    enableSSL: false,
  },
};

export const optionsWithPrepareServer: createServerOptions = {
  serverOptions: {
    ...srvConsts,
  },
  options: {
    ...optConsts,
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
    ...srvConsts,
  },
  options: {
    ...optConsts,
    prepareServer: (server: Server) => {
      server.auth.strategy("test", "test");
    },
  },
};

export const optionsWithOverridePlugin: createServerOptions = {
  serverOptions: {
    ...srvConsts,
  },
  options: {
    ...optConsts,
    plugins: [],
  },
};

export const optionsSsoEnabledSecret: createServerOptions = {
  serverOptions: {
    ...srvConsts,
  },
  options: {
    enableSSO: true,
    ssoCallback: async (user: {
      email: string;
      name: string;
      avatar: any;
      token: string;
      userType: any;
      meta: any;
    }) => {
      // validate user/create
      // generate token
      return {
        url: "redirect_url",
      };
    },
    ...optConsts,
  },
};

export const optionsSsoDisabledSecret: createServerOptions = {
  serverOptions: {
    ...srvConsts,
  },
  options: {
    enableSSO: false,
    ...optConsts,
  },
};
