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
