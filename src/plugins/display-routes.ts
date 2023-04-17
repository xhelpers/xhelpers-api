import { Server } from "@hapi/hapi";
import { IOptions, envIsNotTest } from "../config";

export const registerDisplayRoutes = async (
  server: Server,
  options: IOptions
) => {
  if (envIsNotTest) {
    server.events.on("start", () => {
      console.log("=".repeat(100));
      console.log(`🆙  Server doc    : ${server.info.uri}/documentation`);
      console.log(`🆙  Server api    : ${server.info.uri}/`);

      console.log("=".repeat(100));

      console.log("Routing table:");
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
        console.log(
          `\t${iconRoute} ${route.method} - ${requireAuth ? "🔑 " : ""}\t${
            route.path
          }`
        );
      });
      console.log("=".repeat(100));
    });
  }
};
