import { Server } from "@hapi/hapi";
import { IOptions, envIsTest } from "../config";
import { log } from "../utils";

export const registerDisplayRoutes = async (
  server: Server,
  options: IOptions
) => {
  if (envIsTest) return;

  server.events.on("start", () => {
    log("=".repeat(100));
    log(`🆙  Server doc    : ${server.info.uri}/documentation`);
    log(`🆙  Server api    : ${server.info.uri}/`);
    log("=".repeat(100));

    log("Routing table:");
    server.table().forEach((route) => {
      const ignoreInternalRoute = route.path.includes("swaggerui");
      if (ignoreInternalRoute) return;
      const icons: any = {
        get: "🔎 ",
        post: "📄 ",
        put: "📄 ",
        patch: "📝 ",
        delete: "🚩 ",
      };
      const iconRoute = icons[route.method] || "🚧";
      const requireAuth = !!route.settings.auth;
      log(
        `\t${iconRoute} ${route.method} - ${requireAuth ? "🔑 " : ""}\t${
          route.path
        }`
      );
    });
    log("=".repeat(100));
  });
};
