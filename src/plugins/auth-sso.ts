import * as Boom from "@hapi/boom";
import { Server } from "@hapi/hapi";
import { IOptions, envIsNotTest } from "../config";

import { useAuthGoogle } from "../sso/useAuthGoogle";
import { useAuthGitHub } from "../sso/useAuthGitHub";
import { useAuthFacebook } from "../sso/useAuthFacebook";

export const registerAuthSso = async (server: Server, options: IOptions) => {
  // SSO
  if (options.enableSSO) {
    if (envIsNotTest) console.log("Settings API: SSO enabled;");
    await server.register(require("@hapi/bell"));
    await useAuthGitHub(server, options.ssoCallback);
    await useAuthFacebook(server, options.ssoCallback);
    await useAuthGoogle(server, options.ssoCallback);
  } else {
    if (envIsNotTest) console.log("Settings API: SSO disabled;");
  }
};
