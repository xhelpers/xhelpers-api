import { Server } from "@hapi/hapi";
import { IOptions } from "../config";
import { log } from "../utils";

export const registerRequireSsl = async (server: Server, options: IOptions) => {
  // Redirect to SSL
  if (options.enableSSL) {
    log("Settings API: SSL enabled;");
    await server.register({ plugin: require("hapi-require-https") });
  } else {
    log("Settings API: SSL disabled;");
  }
};
