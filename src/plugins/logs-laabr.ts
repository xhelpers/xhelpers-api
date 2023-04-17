import { Server } from "@hapi/hapi";
import { IOptions, envIsNotTest } from "../config";

const laabr = require("laabr");

export const registerLogsLaabr = (server: Server, options: IOptions) => {
  return {
    name: "laabr-default",
    version: "1.0.0",
    register: async function () {
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
              ignorePaths: ["/health", "/documentation"],
            },
          },
        },
      ]);
    },
  };
};
