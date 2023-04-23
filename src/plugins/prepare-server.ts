import { Server } from "@hapi/hapi";
import { IOptions } from "../config";
import { log } from "../utils";

export const registerServerPrepare = async (
  server: Server,
  options: IOptions
) => {
  // Hapi server
  if (!options?.prepareServer) return;

  try {
    await options.prepareServer(server);
  } catch (err) {
    log("Provided prepareServer function is invalid");
    throw err;
  }
};
