import { authUser } from "./sso-strategy";
import { log } from "../../utils";

export const useAuthGoogle = async (server: any, callback: any) => {
  const googleClientId = process.env.SSO_GOOGLE_CLIENT_ID;
  if (!googleClientId || googleClientId.length === 0) {
    log("Settings API: SSO Google disabled; (SSO_GOOGLE_CLIENT_ID is missing)");
    return;
  }
  if (
    !process.env.SSO_GOOGLE_CLIENT_SECRET ||
    process.env.SSO_GOOGLE_CLIENT_SECRET?.length === 0
  ) {
    log(
      "Settings API: SSO Google disabled; (SSO_GOOGLE_CLIENT_SECRET variable is missing)"
    );
    return;
  }

  // from now on google is enabled
  log("Settings API: SSO Google enabled;");

  if (
    !process.env.SSO_GOOGLE_LOCATION ||
    process.env.SSO_GOOGLE_LOCATION?.length === 0
  ) {
    log(
      "Settings API: [WARNING] SSO Google; (SSO_GOOGLE_LOCATION variable is missing unexpected things can happen)"
    );
  }

  // Google Auth
  server.auth.strategy("google", "bell", {
    provider: "google",
    password: process.env.SSO_GOOGLE_CLIENT_PASSWORD,
    isSecure: process.env.SSO_SECURE_SSL || false,
    clientId: googleClientId,
    clientSecret: process.env.SSO_GOOGLE_CLIENT_SECRET,
    location: process.env.SSO_GOOGLE_LOCATION,
  });

  server.route({
    method: "*",
    path: "/api/sso/google",
    options: {
      tags: ["api", "sso"],
      auth: {
        strategy: "google",
        mode: "try",
      },
    },
    handler: async (request: any, h: any) => {
      if (!request.auth.isAuthenticated) {
        return "Authentication failed due to: " + request.auth.error.message;
      }

      const profile = request.auth.credentials.profile;
      log("Google authentication", profile);
      const user = {
        ...profile,
        email: profile.email,
        name: profile.username || profile.displayName,
        displayName: profile.displayName,
        avatar: profile.raw ? profile.raw.avatar_url : null,
        token: "",
        userType: "Google",
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
  });
};
