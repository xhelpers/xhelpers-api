async function authUser(
  callback: any,
  user: { email: any; name: any; avatar: any; token: string },
  userData: { userType: any; meta: any },
  h: any
) {
  var result = await callback(user, userData);
  user.token = result.token;
  const response = h.redirect(
    `${process.env.FRONT_URL}#/auth?token=${user.token}&email=${user.email}`
  );
  return response;
}

export async function useAuthGoogle(server, callback) {
  // Google Auth
  server.auth.strategy("google", "bell", {
    provider: "google",
    password: "XXXXXXXXXXXXXXXXXXXXXXXXX",
    isSecure: false,
    clientId: process.env.SSO_GOOGLE_CLIENT_ID,
    clientSecret: process.env.SSO_GOOGLE_CLIENT_SECRET,
    location: process.env.SSO_GOOGLE_LOCATION
  });

  server.route({
    method: "*",
    path: "/api/sso/google",
    options: {
      tags: ["api", "sso"],
      auth: {
        strategy: "google",
        mode: "try"
      }
    },
    handler: async function(request, h) {
      if (!request.auth.isAuthenticated) {
        return "Authentication failed due to: " + request.auth.error.message;
      }

      const profile = request.auth.credentials.profile;
      console.log("Google authentication", profile);
      const user = {
        email: profile.email,
        name: profile.username || profile.displayName,
        displayName: profile.displayName,
        avatar: profile.raw ? profile.raw.avatar_url : null,
        token: ""
      };

      try {
        var response = await authUser(
          callback,
          user,
          {
            userType: "Google",
            meta: profile
          },
          h
        );
        return response;
      } catch (error) {
        console.log("err sso: ", error);
        return h.response({
          err: error.message
        });
      }
    }
  });
}

export async function useAuthFacebook(server, callback) {
  //facebook
  server.auth.strategy("facebook", "bell", {
    provider: "facebook",
    password: "XXXXXXXXXXXXXXXXXXXXXXXXX",
    isSecure: false,
    clientId: process.env.SSO_FACEBOOK_CLIENT_ID,
    clientSecret: process.env.SSO_FACEBOOK_CLIENT_SECRET,
    location: process.env.SSO_FACEBOOK_LOCATION
  });

  server.route({
    method: "*",
    path: "/api/sso/facebook",
    options: {
      tags: ["api", "sso"],
      auth: {
        strategy: "facebook",
        mode: "try"
      },
      handler: async function(request, h) {
        if (!request.auth.isAuthenticated) {
          return "Authentication failed due to: " + request.auth.error.message;
        }

        const profile = request.auth.credentials.profile;
        console.log("Facebook authentication", profile);
        const user = {
          email: profile.email,
          name: profile.displayName,
          token: "",
          avatar: ""
        };

        try {
          var response = await authUser(
            callback,
            user,
            {
              userType: "Facebook",
              meta: profile
            },
            h
          );
          return response;
        } catch (error) {
          console.log("err sso: ", error);
          return h.response({
            err: error.message
          });
        }
      }
    }
  });
}

export async function useAuthGitHub(server, callback) {
  // GitHub Auth
  server.auth.strategy("github", "bell", {
    provider: "github",
    password: "XXXXXXXXXXXXXXXXXXXXXXXXX",
    isSecure: false, // For testing or in environments secured via other means
    clientId: process.env.SSO_GITHUB_CLIENT_ID,
    clientSecret: process.env.SSO_GITHUB_CLIENT_SECRET,
    location: process.env.SSO_GITHUB_LOCATION,
    scope: []
  });

  server.route({
    method: ["GET", "POST"],
    path: "/api/sso/github",
    options: {
      tags: ["api", "sso"],
      auth: {
        strategy: "github",
        mode: "try"
      }
    },
    handler: async function(request, h) {
      if (!request.auth.isAuthenticated) {
        return `Authentication failed due to: ${request.auth.error.message}`;
      }

      const profile = request.auth.credentials.profile;
      console.log("Github authentication", profile);
      const user = {
        email: profile.email,
        name: profile.displayName,
        token: "",
        avatar: ""
      };

      try {
        var response = await authUser(
          callback,
          user,
          {
            userType: "Github",
            meta: profile
          },
          h
        );
        return response;
      } catch (error) {
        console.log("err sso: ", error);
        return h
          .response({
            err: error.message
          })
          .code(400);
      }
    }
  });
}
