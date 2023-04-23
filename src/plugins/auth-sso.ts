import { Server } from "@hapi/hapi";
import { IOptions } from "../config";
import { log } from "../utils";

import { useAuthGoogle } from "./sso/useAuthGoogle";
import { useAuthGitHub } from "./sso/useAuthGitHub";
import { useAuthFacebook } from "./sso/useAuthFacebook";

export const registerAuthSso = async (server: Server, options: IOptions) => {
  // SSO
  if (!options.enableSSO) {
    log("Settings API: SSO disabled;");
    return;
  }

  log("Settings API: SSO enabled;");
  await server.register(require("@hapi/bell"));
  await useAuthGitHub(server, options.ssoCallback);
  await useAuthFacebook(server, options.ssoCallback);
  await useAuthGoogle(server, options.ssoCallback);
};
