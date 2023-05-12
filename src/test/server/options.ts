import { Server } from "@hapi/hapi";
import { ICreateServerOptions } from "../../config";

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

export const optionsJwtSecret: ICreateServerOptions = {
  serverOptions: {
    ...srvConsts,
  },
  options: {
    jwt_secret: "secret",
    ...optConsts,
  },
};

export const optionsAppKey: ICreateServerOptions = {
  serverOptions: {
    ...srvConsts,
  },
  options: {
    app_key_auth: "123",
    ...optConsts,
  },
};

export const optionsJwtSecretAndAppKey: ICreateServerOptions = {
  serverOptions: {
    ...srvConsts,
  },
  options: {
    jwt_secret: "secret",
    app_key_auth: "123",
    ...optConsts,
  },
};

export const optionsWithSSL: ICreateServerOptions = {
  serverOptions: {
    ...srvConsts,
  },
  options: {
    ...optConsts,
    enableSSL: true,
  },
};

export const optionsWithoutSSL: ICreateServerOptions = {
  serverOptions: {
    ...srvConsts,
  },
  options: {
    ...optConsts,
    enableSSL: false,
  },
};

export const optionsWithPrepareServer: ICreateServerOptions = {
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

export const optionsWithInvalidPrepareServer: ICreateServerOptions = {
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

export const optionsWithOverridePlugin: ICreateServerOptions = {
  serverOptions: {
    ...srvConsts,
  },
  options: {
    ...optConsts,
    plugins: [],
  },
};

export const optionsSsoEnabledSecret: ICreateServerOptions = {
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

export const optionsSsoDisabledSecret: ICreateServerOptions = {
  serverOptions: {
    ...srvConsts,
  },
  options: {
    enableSSO: false,
    ...optConsts,
  },
};

export const optionsCronJobsDisabled: ICreateServerOptions = {
  serverOptions: {
    ...srvConsts,
  },
  options: {
    enableCronJobs: false,
    ...optConsts,
  },
};

export const optionsCronJobsEnabled: ICreateServerOptions = {
  serverOptions: {
    ...srvConsts,
  },
  options: {
    enableCronJobs: true,
    ...optConsts,
  },
};
