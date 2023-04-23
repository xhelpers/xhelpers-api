import { Server } from "@hapi/hapi";

import * as Vision from "@hapi/vision";
import * as HapiSwagger from "hapi-swagger";
import { IOptions } from "../config";

const Inert = require("@hapi/inert");

export const registerSwagger = async (server: Server, options: IOptions) => {
  if (!options.swaggerOptions) return;

  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: options.swaggerOptions,
    },
  ]);
};
