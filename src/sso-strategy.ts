type UserSso = {
  email: any;
  name: any;
  avatar: any;
  token: string;
  userType: any;
  meta: any;
};

const authUser = async (callback: any, user: UserSso, h: any) => {
  const { url } = await callback(user);
  const response = h.redirect(url);
  return response;
};

export const useAuthGoogle = async (server: any, callback: any) => {
  const googleClientId = process.env.SSO_GOOGLE_CLIENT_ID;
  if (!googleClientId || googleClientId.length === 0) {
    console.log("Settings API: SSO Google disabled; (SSO_GOOGLE_CLIENT_ID is missing)");
    return;
  }
  if (!process.env.SSO_GOOGLE_CLIENT_PASSWORD || process.env.SSO_GOOGLE_CLIENT_PASSWORD?.length < 32) {
    console.log("Settings API: SSO Google disabled; (SSO_GOOGLE_CLIENT_PASSWORD variable is too short (min size: 32) or missing)");
    return;
  }
  if (!process.env.SSO_GOOGLE_CLIENT_SECRET || process.env.SSO_GOOGLE_CLIENT_SECRET?.length === 0) {
    console.log("Settings API: SSO Google disabled; (SSO_GOOGLE_CLIENT_SECRET variable is missing)");
    return;
  }

  // from now on google is enabled
  console.log("Settings API: SSO Google enabled;");

  if (!process.env.SSO_GOOGLE_LOCATION || process.env.SSO_GOOGLE_LOCATION?.length === 0) {
    console.log("Settings API: [WARNING] SSO Google; (SSO_GOOGLE_LOCATION variable is missing unexpected things can happen)");
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
      console.log("Google authentication", profile);
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
      } catch (error) {
        console.log("err sso: ", error);
        return h.response({
          err: error.message,
        });
      }
    },
  });
};

export const useAuthFacebook = async (server: any, callback: any) => {
  const facebookClientId = process.env.SSO_FACEBOOK_CLIENT_ID;
  if (!facebookClientId || facebookClientId.length === 0) {
    console.log("Settings API: SSO Facebook disabled; (SSO_FACEBOOK_CLIENT_ID is missing)");
    return;
  }
  if (!process.env.SSO_FACEBOOK_CLIENT_PASSWORD || process.env.SSO_FACEBOOK_CLIENT_PASSWORD?.length < 32) {
    console.log("Settings API: SSO Facebook disabled; (SSO_FACEBOOK_CLIENT_PASSWORD variable is too short (min size: 32) or missing)");
    return;
  }
  if (!process.env.SSO_FACEBOOK_CLIENT_SECRET || process.env.SSO_FACEBOOK_CLIENT_SECRET?.length === 0) {
    console.log("Settings API: SSO Facebook disabled; (SSO_FACEBOOK_CLIENT_SECRET variable is missing)");
    return;
  }

  // from now on facebook is enabled
  console.log("Settings API: SSO Facebook enabled;");

  if (!process.env.SSO_FACEBOOK_LOCATION || process.env.SSO_FACEBOOK_LOCATION?.length === 0) {
    console.log("Settings API: [WARNING] SSO Facebook; (SSO_FACEBOOK_LOCATION variable is missing unexpected things can happen)");
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
        console.log("Facebook authentication", profile);
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
        } catch (error) {
          console.log("err sso: ", error);
          return h.response({
            err: error.message,
          });
        }
      },
    },
  });
};

export const useAuthGitHub = async (server: any, callback: any) => {
  const githubClientId = process.env.SSO_GITHUB_CLIENT_ID;
  if (!githubClientId || githubClientId.length === 0) {
    console.log("Settings API: SSO Github disabled; (SSO_GITHUB_CLIENT_ID is missing)");
    return;
  }

  if (!process.env.SSO_GITHUB_CLIENT_PASSWORD || process.env.SSO_GITHUB_CLIENT_PASSWORD?.length < 32) {
    console.log("Settings API: SSO Github disabled; (SSO_GITHUB_CLIENT_PASSWORD variable is too short (min size: 32) or missing)");
    return;
  }
  if (!process.env.SSO_GITHUB_CLIENT_SECRET || process.env.SSO_GITHUB_CLIENT_SECRET?.length === 0) {
    console.log("Settings API: SSO Github disabled; (SSO_GITHUB_CLIENT_SECRET variable is missing)");
    return;
  }

  // from now on github is enabled
  console.log("Settings API: SSO Github enabled;");

  if (!process.env.SSO_GITHUB_LOCATION || process.env.SSO_GITHUB_LOCATION?.length === 0) {
    console.log("Settings API: [WARNING] SSO Github; (SSO_GITHUB_LOCATION variable is missing unexpected things can happen)");
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
      } catch (error) {
        console.log("err sso: ", error);
        return h
          .response({
            err: error.message,
          })
          .code(400);
      }
    },
  });
};
