import * as ChaiAsPromised from "chai-as-promised";
import { expect, use } from "chai";
import { Server } from "@hapi/hapi";
import { createServer } from "../server";
import { ICreateServerOptions } from "../config";

import {
  optionsJwtSecret,
  optionsAppKey,
  optionsJwtSecretAndAppKey,
  optionsWithSSL,
  optionsWithoutSSL,
  optionsWithPrepareServer,
  optionsWithInvalidPrepareServer,
  optionsWithOverridePlugin,
  optionsSsoEnabledSecret,
  optionsSsoDisabledSecret,
  optionsCronJobsDisabled,
  optionsCronJobsEnabled,
} from "./server/options";
import { authUser } from "../plugins/sso/sso-strategy";

use(ChaiAsPromised);

let server: Server | null = null;

describe("🚧  Testing Server Configs  🚧", () => {
  before(async () => {});
  after(async () => {});

  beforeEach(async () => {
    server = null;
  });

  afterEach(async () => {});

  describe("Auth Options", async () => {
    it("JWT Secret", async () => {
      server = await createServer(optionsJwtSecret);
    });

    it("App Key", async () => {
      server = await createServer(optionsAppKey);
    });

    it("JWT Secret and App Key", async () => {
      server = await createServer(optionsJwtSecretAndAppKey);
    });
  });

  describe("SSO Options", async () => {
    it("SSO enabled without providers (empty environment keys)", async () => {
      server = await createServer(optionsSsoEnabledSecret);
    });

    it("SSO disabled without providers (empty environment keys)", async () => {
      server = await createServer(optionsSsoDisabledSecret);
    });

    it("useAuthFacebook invalid - SSO_FACEBOOK_CLIENT_ID", async () => {
      process.env.SSO_FACEBOOK_CLIENT_ID = "";
      server = await createServer(optionsSsoEnabledSecret);
    });

    it("useAuthFacebook invalid - SSO_FACEBOOK_CLIENT_SECRET", async () => {
      process.env.SSO_FACEBOOK_CLIENT_ID = "SSO_FACEBOOK_CLIENT_ID";
      process.env.SSO_FACEBOOK_CLIENT_SECRET = "";
      server = await createServer(optionsSsoEnabledSecret);
    });

    it("useAuthFacebook valid", async () => {
      process.env.SSO_FACEBOOK_CLIENT_ID = "SSO_FACEBOOK_CLIENT_ID";
      process.env.SSO_FACEBOOK_CLIENT_SECRET = "SSO_FACEBOOK_CLIENT_SECRET";
      process.env.SSO_FACEBOOK_CLIENT_PASSWORD = "SSO_FACEBOOK_CLIENT_PASSWORD";
      process.env.SSO_FACEBOOK_LOCATION = "SSO_FACEBOOK_LOCATION";

      server = await createServer(optionsSsoEnabledSecret);
    });

    it("useAuthGitHub invalid - SSO_GITHUB_CLIENT_ID", async () => {
      process.env.SSO_GITHUB_CLIENT_ID = "";
      server = await createServer(optionsSsoEnabledSecret);
    });

    it("useAuthGitHub invalid - SSO_GITHUB_CLIENT_SECRET", async () => {
      process.env.SSO_GITHUB_CLIENT_ID = "SSO_GITHUB_CLIENT_ID";
      process.env.SSO_GITHUB_CLIENT_SECRET = "";
      server = await createServer(optionsSsoEnabledSecret);
    });

    it("useAuthGitHub valid", async () => {
      process.env.SSO_GITHUB_CLIENT_ID = "SSO_GITHUB_CLIENT_ID";
      process.env.SSO_GITHUB_CLIENT_SECRET = "SSO_GITHUB_CLIENT_SECRET";
      process.env.SSO_GITHUB_CLIENT_PASSWORD = "SSO_GITHUB_CLIENT_PASSWORD";
      process.env.SSO_GITHUB_LOCATION = "SSO_GITHUB_LOCATION";

      server = await createServer(optionsSsoEnabledSecret);
    });

    it("useAuthGoogle invalid - SSO_GOOGLE_CLIENT_ID", async () => {
      process.env.SSO_GOOGLE_CLIENT_ID = "";
      server = await createServer(optionsSsoEnabledSecret);
    });

    it("useAuthGoogle invalid - SSO_GOOGLE_CLIENT_SECRET", async () => {
      process.env.SSO_GOOGLE_CLIENT_ID = "SSO_GOOGLE_CLIENT_ID";
      process.env.SSO_GOOGLE_CLIENT_SECRET = "";
      server = await createServer(optionsSsoEnabledSecret);
    });

    it("useAuthGoogle invalid - SSO_GOOGLE_LOCATION", async () => {
      process.env.SSO_GOOGLE_CLIENT_ID = "SSO_GOOGLE_CLIENT_ID";
      process.env.SSO_GOOGLE_CLIENT_SECRET = "SSO_GOOGLE_CLIENT_SECRET";
      process.env.SSO_GOOGLE_CLIENT_PASSWORD = "SSO_GOOGLE_CLIENT_PASSWORD";
      process.env.SSO_GOOGLE_LOCATION = "";
      try {
        server = await createServer(optionsSsoEnabledSecret);
      } catch (error: any) {
        expect(
          error.message.includes('"location" is not allowed to be empty')
        ).to.equal(true);
      }
    });

    it("useAuthGoogle valid", async () => {
      process.env.SSO_GOOGLE_CLIENT_ID = "SSO_GOOGLE_CLIENT_ID";
      process.env.SSO_GOOGLE_CLIENT_SECRET = "SSO_GOOGLE_CLIENT_SECRET";
      process.env.SSO_GOOGLE_CLIENT_PASSWORD = "SSO_GOOGLE_CLIENT_PASSWORD";
      process.env.SSO_GOOGLE_LOCATION = "SSO_GOOGLE_LOCATION";
      server = await createServer(optionsSsoEnabledSecret);
    });

    it("SSO should redirect to the provided URL", async () => {
      const user = {
        email: "example@example.com",
        name: "John Doe",
        avatar: "https://example.com/avatar.png",
        token: "sample-token",
        userType: "user",
        meta: {},
      };

      const callback = async (u: any) => {
        return { url: "https://example.com/redirect" };
      };

      const h = {
        redirect: (url: string) => {
          return { url };
        },
      };

      const response = await authUser(callback, user, h);
      expect(response.url).to.equal("https://example.com/redirect");
    });
  });

  describe("SSL options", async () => {
    it("With SSL", async () => {
      server = await createServer(optionsWithSSL);
    });

    it("Without SSL", async () => {
      server = await createServer(optionsWithoutSSL);
    });
  });

  describe("CronJobs options", async () => {
    it("Enabled CronJobs", async () => {
      process.env.LOG_LEVEL = "HIGH";
      server = await createServer(optionsCronJobsEnabled);
      const { plugins }: any = server;
      const service = plugins["cronjobs"].service;
      service.addJob({
        name: "JobHolderTest",
        time: "0 0 * * *", // At 00:00.
        timezone: "America/Sao_Paulo",
        request: {
          method: "GET",
          url: "/health",
        },
        onComplete: (res: any) => {
          console.log("onComplete");
        },
      });
    });

    it("Disabled CronJobs", async () => {
      process.env.LOG_LEVEL = "LOW";
      server = await createServer(optionsCronJobsDisabled);
    });
  });

  describe("prepareServer function", async () => {
    it("Passing prepareServer", async () => {
      server = await createServer(optionsWithPrepareServer);
      expect(server.auth.settings.default.strategies?.[0]).to.equal("test");
      expect(server.auth.settings.default.mode).to.equal("required");
    });

    it("Passing invalid prepareServer", async () => {
      let err;
      try {
        server = await createServer(optionsWithInvalidPrepareServer);
        err = false;
      } catch (e) {
        err = true;
      }

      if (!err) throw Error("Should happen error");
    });
  });

  describe("Invalid options", async () => {
    it("Empty options", async () => {
      let err;
      try {
        server = await createServer({} as ICreateServerOptions);
        err = false;
      } catch (e) {
        err = true;
      }

      if (!err) throw Error("Should happen error");
    });
  });

  describe("Plugin options", async () => {
    it("With Custom Override Plugin", async () => {
      optionsWithOverridePlugin.options.plugins = [
        {
          plugin: { name: "swagger", register: () => {} },
          options: {
            colored: false,
            formats: {
              response:
                "[:time[iso]] URL: :url ':method' StatusCode: ':status' Time Elapsed: (:responseTime ms)",
            },
            hapiPino: {
              logPayload: false,
              mergeHapiLogData: true,
            },
          },
        },
      ] as any;
    });

    it("With new Override Plugin", async () => {
      optionsWithOverridePlugin.options.plugins = [
        {
          plugin: { name: "swagger", register: () => {} },
          options: {
            colored: false,
            formats: {
              response: "':method' StatusCode: ':status'",
            },
            hapiPino: {
              logPayload: false,
              mergeHapiLogData: true,
            },
          },
        },
      ] as any;

      server = await createServer(optionsWithOverridePlugin);
    });

    it("With Sentry Plugin Enabled", async () => {
      optionsWithOverridePlugin.options.sentryOptions = {
        dsn: "test-sentry-enabled",
        version: "1.0",
      };

      server = await createServer(optionsWithOverridePlugin);
    });
  });

  describe("Plugins settings", async () => {
    it("With Sentry Plugin Disabled", async () => {
      optionsWithOverridePlugin.options.sentryOptions = undefined;
      server = await createServer(optionsWithOverridePlugin);
    });

    it("With Sentry Plugin Enabled", async () => {
      optionsWithOverridePlugin.options.sentryOptions = {
        dsn: "test-sentry-enabled",
        version: "1.0",
      };
      server = await createServer(optionsWithOverridePlugin);
    });
  });
});
