import { Server } from "@hapi/hapi";
import { IOptions } from "../config";

const laabr = require("laabr");

export const registerLogsLaabr = (server: Server, options: IOptions) => {
  return {
    name: "laabr-default",
    version: "1.0.0",
    register: async () => {
      await server.register([
        {
          plugin: laabr,
          options: {
            colored: true,
            formats: {
              response:
                "[:time[iso]] :method :url :status (:responseTime ms) :payload",
            },
            hapiPino: {
              logPayload: true,
              mergeHapiLogData: true,
              ignorePaths: ["/health", "/liveness", "/documentation"],
            },
          },
        },
      ]);
    },
  };
};
