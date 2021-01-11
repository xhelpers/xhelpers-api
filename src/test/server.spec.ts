import * as ChaiAsPromised from "chai-as-promised";
import { use } from "chai";
import { Server } from "@hapi/hapi";
import { createServer } from "../server";
import { optionsJwtSecret, optionsAppKey, optionsJwtSecretAndAppKey } from "./server/options";

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
});
