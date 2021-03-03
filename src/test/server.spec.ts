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

  describe("SSL options", async () => {
    it("With SSL", async () => {
      server = await createServer(optionsWithSSL);
    });

    it("Without SSL", async () => {
      server = await createServer(optionsWithoutSSL);
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
