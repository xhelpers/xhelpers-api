import { authUser } from "./sso-strategy";
import { log } from "../../utils";

export const useAuthGitHub = async (server: any, callback: any) => {
  const githubClientId = process.env.SSO_GITHUB_CLIENT_ID;
  if (!githubClientId || githubClientId.length === 0) {
    log("Settings API: SSO Github disabled; (SSO_GITHUB_CLIENT_ID is missing)");
    return;
  }
  if (
    !process.env.SSO_GITHUB_CLIENT_SECRET ||
    process.env.SSO_GITHUB_CLIENT_SECRET?.length === 0
  ) {
    log(
      "Settings API: SSO Github disabled; (SSO_GITHUB_CLIENT_SECRET variable is missing)"
    );
    return;
  }

  // from now on github is enabled
  log("Settings API: SSO Github enabled;");

  if (
    !process.env.SSO_GITHUB_LOCATION ||
    process.env.SSO_GITHUB_LOCATION?.length === 0
  ) {
    log(
      "Settings API: [WARNING] SSO Github; (SSO_GITHUB_LOCATION variable is missing unexpected things can happen)"
    );
  }
  // GitHub Auth
  server.auth.strategy("github", "bell", {
    provider: "github",
    password: process.env.SSO_GITHUB_CLIENT_PASSWORD,
    isSecure: process.env.SSO_SECURE_SSL || false,
    clientId: githubClientId,
    clientSecret: process.env.SSO_GITHUB_CLIENT_SECRET,
    location: process.env.SSO_GITHUB_LOCATION,
    scope: [],
  });

  server.route({
    method: ["GET", "POST"],
    path: "/api/sso/github",
    options: {
      tags: ["api", "sso"],
      auth: {
        strategy: "github",
        mode: "try",
      },
    },
    handler: async (request: any, h: any) => {
      if (!request.auth.isAuthenticated) {
        return `Authentication failed due to: ${request.auth.error.message}`;
      }

      const profile = request.auth.credentials.profile;
      console.log("Github authentication", profile);
      const user = {
        ...profile,
        email: profile.email,
        name: profile.displayName,
        token: "",
        avatar: "",
        userType: "Github",
        meta: profile,
      };

      try {
        const response = await authUser(callback, user, h);
        return response;
      } catch (error: any) {
        log("err sso: ", error);
        return h
          .response({
            err: error.message,
          })
          .code(400);
      }
    },
  });
};
