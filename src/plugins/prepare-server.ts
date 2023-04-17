import { Server } from "@hapi/hapi";
import { IOptions, envIsNotTest } from "../config";

export const registerServerPrepare = async (
  server: Server,
  options: IOptions
) => {
  // Hapi server
  if (options?.prepareServer) {
    try {
      await options.prepareServer(server);
    } catch (err) {
      console.log("Provided prepareServer function is invalid");
      throw err;
    }
  }
};
