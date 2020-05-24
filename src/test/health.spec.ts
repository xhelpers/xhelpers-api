require("dotenv").config();

import * as ChaiAsPromised from "chai-as-promised";

import { expect, use } from "chai";

import { createServer } from "../server";

let server: any = null;
use(ChaiAsPromised);

describe("🚧  Testing API Health  🚧", () => {
  before(async () => {
    const options: any = {
      serverOptions: {
        port: 5005,
        host: process.env.HOST || "127.0.0.1",
      },
      options: {
        jwt_secret: "SecretTests",
        swaggerOptions: {
          info: {
            title: "Test API",
            version: "1.0",
            contact: {
              name: "todo test",
              email: "tester@test.com",
            },
          },
          schemes: [process.env.SSL === "true" ? "https" : "http"],
          grouping: "tags",
        },
        routeOptions: {
          routes: "**/routes/*.js",
        },
      },
    };

    server = await createServer(options);
    await server.start();
    return Promise.resolve();
  });

  after(async () => {
    if (server) await server.stop();
    return Promise.resolve();
  });

  beforeEach(async () => {});
  afterEach(async () => {});

  describe("Health API", async () => {
    it("/documentation should return 200", async () => {
      const response = await server.inject("/documentation");
      expect(response.statusCode).to.equal(200);
      return Promise.resolve();
    });

    it("/health should return 200", async () => {
      const options = {
        method: "GET",
        url: "/health",
      };
      const response = await server.inject(options);
      expect(response.statusCode).to.equal(200);
      expect(response.result.status).to.equal("Server running");
      expect(response.result.code).to.equal(200);
      return Promise.resolve();
    });

    it("/status should return 200", async () => {
      const options = {
        method: "GET",
        url: "/status",
      };
      const response = await server.inject(options);
      expect(response.statusCode).to.equal(200);
      return Promise.resolve();
    });
  });
});
