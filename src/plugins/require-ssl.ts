import { Server } from "@hapi/hapi";
import { IOptions, envIsNotTest } from "../config";

export const registerRequireSsl = async (server: Server, options: IOptions) => {
  // Redirect to SSL
  if (options.enableSSL) {
    if (envIsNotTest) console.log("Settings API: SSL enabled;");
    await server.register({ plugin: require("hapi-require-https") });
  } else {
    if (envIsNotTest) console.log("Settings API: SSL disabled;");
  }
};
