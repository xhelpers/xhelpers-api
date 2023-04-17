import { Server } from "@hapi/hapi";
import { IOptions, envIsNotTest } from "../config";

export const registerExternalPlugins = async (
  server: Server,
  options: IOptions
) => {
  if (!options.plugins || options.plugins.length <= 0) return;

  const { plugins } = options;
  // Hapi plugins
  const defaultPlugins: any = [];
  const allPlugins = plugins.concat(
    defaultPlugins.filter(
      (defp: any) => !plugins.find((f: any) => f.plugin == defp.plugin)
    )
  );
  await server.register(allPlugins);
};
