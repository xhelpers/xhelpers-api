import { Server } from "@hapi/hapi";
import { IOptions } from "../config";

export const registerLoadRoutes = async (server: Server, options: IOptions) => {
  if (!options.routeOptions) return;

  process.env.JWT_ENABLED = (!!options.jwt_secret).toString();
  process.env.APPKEY_ENABLED = (!!options.app_key_auth).toString();

  const { routes } = options.routeOptions;
  const glob = require("glob");
  const routeFiles: [] = await new Promise((resolve, reject) =>
    glob(routes, (err: any, files: any) => {
      if (err != null) reject(err);
      else resolve(files);
    })
  );

  for (const file of routeFiles) {
    const filePath = process.cwd() + "/" + file;
    // force clear cache
    delete require.cache[require.resolve(filePath)];
    const route = require(filePath);
    server.route(route.default || route);
  }
};
