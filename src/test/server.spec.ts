import * as ChaiAsPromised from "chai-as-promised";
import { expect, use } from "chai";
import { Server } from "@hapi/hapi";
import { createServer, createServerOptions } from "../server";
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
      process.env.SSO_GITHUB_CLIENT_ID = "SSO_GITHUB_CLIENT_ID";
      process.env.SSO_GOOGLE_CLIENT_SECRET = "";
      server = await createServer(optionsSsoEnabledSecret);
    });

    it("useAuthGoogle valid", async () => {
      process.env.SSO_GOOGLE_CLIENT_ID = "SSO_GOOGLE_CLIENT_ID";
      process.env.SSO_GOOGLE_CLIENT_SECRET = "SSO_GOOGLE_CLIENT_SECRET";
      process.env.SSO_GOOGLE_CLIENT_PASSWORD = "SSO_GOOGLE_CLIENT_PASSWORD";
      process.env.SSO_GOOGLE_LOCATION = "SSO_GOOGLE_LOCATION";
      server = await createServer(optionsSsoEnabledSecret);
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
        server = await createServer({} as createServerOptions);
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
          plugin: require("laabr"),
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
          plugin: require("laabr"),
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
  });
});
