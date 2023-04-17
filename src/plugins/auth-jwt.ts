import { Server } from "@hapi/hapi";
import { IOptions, envIsNotTest } from "../config";

export const registerAuthJwt = async (server: Server, options: IOptions) => {
  // JWT Secret
  if (!options.jwt_secret) {
    if (envIsNotTest) console.log("Settings API: JWT disabled;");
  } else {
    if (!process.env.JWT_ISSUER)
      console.log("Settings API: JWT disabled; (missing variable JWT_ISSUER)");
    if (!process.env.JWT_EXPIRE)
      console.log("Settings API: JWT disabled; (missing variable JWT_EXPIRE)");
    if (envIsNotTest) console.log("Settings API: JWT enabled;");

    // Hapi JWT auth
    await server.register(require("hapi-auth-jwt2"));

    try {
      server.auth.strategy("jwt", "jwt", {
        key: options.jwt_secret,
        validate: validateFunc,
        verifyOptions: { algorithms: ["HS256"] },
      });

      if (!!options.jwt_secret || !options.app_key_auth) {
        server.auth.default("jwt");
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

const validateFunc = async (decoded: any) => {
  return {
    isValid: true,
    credentials: decoded,
  };
};
