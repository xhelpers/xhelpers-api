import * as ChaiAsPromised from "chai-as-promised";
import { expect, use } from "chai";
import { Server } from "@hapi/hapi";
import { createServer, createServerOptions } from "../server";
import {
  optionsJwtSecret, optionsAppKey, optionsJwtSecretAndAppKey,
  optionsWithSSL, optionsWithoutSSL, optionsWithPrepareServer,
  optionsWithInvalidPrepareServer
} from "./server/options";

use(ChaiAsPromised);

let server: Server | null = null;

describe("🚧  Testing Server Configs  🚧", () => {
  before(async () => {});
  after(async () => {});

  beforeEach(async () => {
    server = null;
  });

  afterEach(async() => {});

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

  describe("prepareServer function", async() => {
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
      } catch(e) {
        err = true;
      }

      if(!err) throw Error("Should happen error");
    });
  });

  describe("Invalid options", async () => {
    it("Empty options", async () => {
      let err;
      try {
        server = await createServer({} as createServerOptions);
        err = false;
      } catch(e) {
        err = true;
      }

      if(!err) throw Error("Should happen error");
    });
  });
});
