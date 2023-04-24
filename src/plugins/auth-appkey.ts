import * as Boom from "@hapi/boom";
import { Server } from "@hapi/hapi";
import { IOptions } from "../config";
import { log } from "../utils";

export const registerAuthAppKey = async (server: Server, options: IOptions) => {
  // AppKey Secret
  const appKeyAuth = options.app_key_auth;
  if (!appKeyAuth) {
    log("Settings API: AppKey disabled;");
    return;
  }

  log("Settings API: AppKey enabled;");

  try {
    server.auth.scheme("appkey", (server: any, options: any) => {
      return {
        authenticate: (req: any, resp: any) => {
          const { appkey } = req.headers;
          if (!appkey)
            return Boom.unauthorized(
              "Header has to include 'appkey' key with value of the application key."
            );
          if (appkey !== appKeyAuth) return Boom.unauthorized();
          return resp.continue;
        },
      };
    });

    server.auth.strategy("appkey", "appkey");

    if (!options.jwt_secret && !!options.app_key_auth) {
      server.auth.default("appkey");
    }
  } catch (error: any) {
    if (
      [
        "Cannot set default strategy more than once",
        "Authentication scheme name already exists",
      ].some((element: any) => error.message.includes(element))
    ) {
      return true;
    }
    throw error; // If it's a different error, re-throw it
  }
};
