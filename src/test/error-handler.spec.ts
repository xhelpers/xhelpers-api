require("dotenv").config();
import * as ChaiAsPromised from "chai-as-promised";
import { expect, use } from "chai";
import { errorHandler } from "../utils/error-handler";
import { Boom } from "../tools";

use(ChaiAsPromised);

describe("🚧  Testing Error handler  🚧", () => {
  before(async () => {});
  after(async () => {});
  beforeEach(async () => {});
  afterEach(async () => {});

  describe("errorHandler", async () => {
    it("should return Boom error if the input is a Boom error", async () => {
      const boomError = Boom.badRequest("Test Boom error");
      const result = await errorHandler(boomError);
      expect(result).to.be.an.instanceOf(Boom.Boom);
      expect(result.output.statusCode).to.equal(400);
      expect(result.message).to.equal("Test Boom error");
    });

    it("should return a 400 Boom error if the input is a string", async () => {
      const errorString = "Test string error";
      const result = await errorHandler(errorString);
      expect(result).to.be.an.instanceOf(Boom.Boom);
      expect(result.output.statusCode).to.equal(400);
      expect(result.message).to.equal("Test string error");
    });

    it("should return a 400 Boom error for a MongoError", async () => {
      const mongoError: any = new Error("");
      mongoError.name = "MongoError";
      mongoError.code = "11000";
      mongoError.errmsg = "duplicate key error";

      const result = await errorHandler(mongoError);
      expect(result).to.be.an.instanceOf(Boom.Boom);
      expect(result.output.statusCode).to.equal(400);
      expect(result.message).to.equal("Bad request 11000-duplicate key error");
    });

    it("should return a 401 Boom error for a JsonWebTokenError", async () => {
      const jwtError: any = new Error("");
      jwtError.name = "JsonWebTokenError";
      const result = await errorHandler(jwtError);
      expect(result).to.be.an.instanceOf(Boom.Boom);
      expect(result.output.statusCode).to.equal(401);
      expect(result.message).to.equal("Authorization error");
    });

    it("should return a 400 Boom error for a ValidationError", async () => {
      const validationError: any = new Error("");
      validationError.name = "ValidationError";
      validationError.errors = {
        field1: {
          message: "Field1 is required",
        },
        field2: {
          message: "Field2 is invalid",
        },
      };

      const result = await errorHandler(validationError);
      expect(result).to.be.an.instanceOf(Boom.Boom);
      expect(result.output.statusCode).to.equal(400);
      expect(result.message).to.equal("Bad Request");
      expect((result as any).errors.field1.message).to.equal(
        "Field1 is required"
      );
      expect((result as any).errors.field2.message).to.equal(
        "Field2 is invalid"
      );
    });

    it("should return a 401 Boom error for an UnauthorizedError", async () => {
      const unauthorizedError: any = new Error("");
      unauthorizedError.name = "UnauthorizedError";
      const result = await errorHandler(unauthorizedError);
      expect(result).to.be.an.instanceOf(Boom.Boom);
      expect(result.output.statusCode).to.equal(401);
      expect(result.message).to.equal("Invalid Token");
    });

    it("should return a 400 Boom error by default", async () => {
      const defaultError = new Error("Test default error");
      const result = await errorHandler(defaultError);
      expect(result).to.be.an.instanceOf(Boom.Boom);
      expect(result.output.statusCode).to.equal(400);
      expect(result.message).to.equal("Test default error");
    });

    it("should return a 500 Boom error if nothing is more suitable", async () => {
      const defaultError = new Error();
      defaultError.name = "NothingLikeIt";
      defaultError.message = "Test 500 error";

      const result = await errorHandler(defaultError);
      expect(result).to.be.an.instanceOf(Boom.Boom);
      expect(result.output.statusCode).to.equal(500);
      expect(result.message).to.equal("Test 500 error: Test 500 error");
    });
  });
});
