import * as Boom from "@hapi/boom";
import { Server } from "@hapi/hapi";
import { IOptions, envIsNotTest } from "../config";

export const registerAuthAppKey = async (server: Server, options: IOptions) => {
  // AppKey Secret
  if (!options.jwt_secret) {
    if (envIsNotTest) console.log("Settings API: AppKey disabled;");
  } else {
    if (envIsNotTest) console.log("Settings API: AppKey enabled;");

    try {
      server.auth.scheme("appkey", (server: any, options: any) => {
        return {
          authenticate: (req: any, resp: any) => {
            const { appkey } = req.headers;
            if (!appkey)
              return Boom.unauthorized(
                "Header has to include 'appkey' key with value of the application key."
              );
            if (appkey !== options.app_key_auth) return Boom.unauthorized();
            return resp.continue;
          },
        };
      });

      server.auth.strategy("appkey", "appkey");

      if (!options.jwt_secret || !!options.app_key_auth) {
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
  }
};
