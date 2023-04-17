import { Server } from "@hapi/hapi";
import { IOptions, envIsNotTest } from "../config";

export const registerHealthCheck = async (
  server: Server,
  options: IOptions
) => {
  server.route({
    method: "GET",
    path: "/health",
    options: {
      tags: ["api", "health"],
      description: "Check health",
      auth: false,
    },
    handler: (request, h) => {
      return {
        status: "Server running",
        code: 200,
      };
    },
  });

  server.route({
    method: "GET",
    path: "/liveness",
    options: {
      tags: ["api", "health"],
      description: "Check liveness",
      auth: false,
    },
    handler: (request, h) => {
      return {
        status: "Server running",
        code: 200,
      };
    },
  });
};
