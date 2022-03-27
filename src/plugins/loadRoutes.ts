import * as Hapi from "@hapi/hapi";

export async function loadRoutes(routeOptions: any, server: Hapi.Server) {
  const { routes } = routeOptions;
  const glob = require("glob");
  const routeFiles: [] = await new Promise((res, rej) =>
    glob(routes, (err: any, files: any) => {
      if (err != null) rej(err);
      else res(files);
    })
  );
  for (const file of routeFiles) {
    const route = require(process.cwd() + "/" + file);
    server.route(route.default || route);
  }
}
