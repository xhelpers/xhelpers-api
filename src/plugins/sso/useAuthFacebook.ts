import { authUser } from "./sso-strategy";
import { log } from "../../utils";

export const useAuthFacebook = async (server: any, callback: any) => {
  const facebookClientId = process.env.SSO_FACEBOOK_CLIENT_ID;
  if (!facebookClientId || facebookClientId.length === 0) {
    log(
      "Settings API: SSO Facebook disabled; (SSO_FACEBOOK_CLIENT_ID is missing)"
    );
    return;
  }
  if (
    !process.env.SSO_FACEBOOK_CLIENT_SECRET ||
    process.env.SSO_FACEBOOK_CLIENT_SECRET?.length === 0
  ) {
    log(
      "Settings API: SSO Facebook disabled; (SSO_FACEBOOK_CLIENT_SECRET variable is missing)"
    );
    return;
  }

  // from now on facebook is enabled
  log("Settings API: SSO Facebook enabled;");

  if (
    !process.env.SSO_FACEBOOK_LOCATION ||
    process.env.SSO_FACEBOOK_LOCATION?.length === 0
  ) {
    log(
      "Settings API: [WARNING] SSO Facebook; (SSO_FACEBOOK_LOCATION variable is missing unexpected things can happen)"
    );
  }

  //facebook
  server.auth.strategy("facebook", "bell", {
    provider: "facebook",
    password: process.env.SSO_FACEBOOK_CLIENT_PASSWORD,
    isSecure: process.env.SSO_SECURE_SSL || false,
    clientId: facebookClientId,
    clientSecret: process.env.SSO_FACEBOOK_CLIENT_SECRET,
    location: process.env.SSO_FACEBOOK_LOCATION,
  });

  server.route({
    method: "*",
    path: "/api/sso/facebook",
    options: {
      tags: ["api", "sso"],
      auth: {
        strategy: "facebook",
        mode: "try",
      },
      handler: async (request: any, h: any) => {
        if (!request.auth.isAuthenticated) {
          return "Authentication failed due to: " + request.auth.error.message;
        }

        const profile = request.auth.credentials.profile;
        log("Facebook authentication", profile);
        const user = {
          ...profile,
          email: profile.email,
          name: profile.displayName,
          token: "",
          avatar: "",
          userType: "Facebook",
          meta: profile,
        };

        try {
          const response = await authUser(callback, user, h);
          return response;
        } catch (error: any) {
          log("err sso: ", error);
          return h.response({
            err: error.message,
          });
        }
      },
    },
  });
};
