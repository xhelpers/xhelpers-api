import * as ChaiAsPromised from "chai-as-promised";
import { expect, use } from "chai";
import { safeCall } from "../utils";
import { Boom } from "../tools";

use(ChaiAsPromised);

describe("🚧  Testing SafeCall  🚧", () => {
  before(async () => {});
  after(async () => {});
  beforeEach(() => {});
  afterEach(() => {});

  describe("safeCall", () => {
    it("should throw an error if action is not a function", async () => {
      const request = {
        method: "GET",
        path: "/test",
        auth: { credentials: { user: {} }, token: "test-token" },
      };

      try {
        await safeCall(request, "not a function" as any);
        expect.fail("Expected safeCall to throw an error");
      } catch (error) {
        expect(error).to.equal("Parameter 'action' must be a function.");
      }
    });

    it("should return the result of the action", async () => {
      const request = {
        method: "GET",
        path: "/test",
        auth: {
          isAuthenticated: true,
          credentials: { user: { email: "test@example.com", _id: "123" } },
          token: "test-token",
        },
      };

      const action = async (user: any) => {
        return { success: true, user };
      };

      const result = await safeCall(request, action);
      expect(result).to.deep.equal({
        success: true,
        user: {
          email: "test@example.com",
          _id: "123",
          id: "123",
          token: "test-token",
        },
      });
    });

    it("should return the result of the action and log timers", async () => {
      const request = {
        method: "GET",
        path: "/test",
        auth: {
          isAuthenticated: true,
          credentials: { user: { email: "test@example.com", _id: "123" } },
          token: "test-token",
        },
      };

      const action = async (user: any) => {
        return { success: true, user };
      };
      process.env.NODE_ENV = "DEV";
      const result = await safeCall(request, action);
      process.env.NODE_ENV = "TEST";
      expect(result).to.deep.equal({
        success: true,
        user: {
          email: "test@example.com",
          _id: "123",
          id: "123",
          token: "test-token",
        },
      });
    });

    it("should return an error response if action throws an error", async () => {
      const request = {
        method: "GET",
        path: "/test",
        auth: {
          isAuthenticated: true,
          credentials: { user: { email: "test@example.com", _id: "123" } },
          token: "test-token",
        },
      };

      const action = async (user: any) => {
        throw new Error("Test error");
      };

      const result = await safeCall(request, action);
      expect(result).to.be.an.instanceOf(Boom.Boom);
      expect(result.output.statusCode).to.equal(400);
      expect(result.output.payload.error).to.equal("Bad Request");
      expect(result.output.payload.message).to.equal("Test error");
    });
  });
});
