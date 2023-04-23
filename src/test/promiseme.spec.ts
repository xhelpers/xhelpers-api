require("dotenv").config();
import * as ChaiAsPromised from "chai-as-promised";
import { expect, use } from "chai";
import { promiseMe } from "../utils";

use(ChaiAsPromised);

describe("🚧  Testing PromiseMe  🚧", () => {
  before(async () => {});
  after(async () => {});
  beforeEach(() => {});
  afterEach(() => {});

  describe("PromiseMe", async () => {
    it("should resolve with data and undefined error", async () => {
      const testPromise = Promise.resolve("test_data");
      const result = await promiseMe(testPromise);
      expect(result).to.deep.equal(["test_data", undefined]);
    });

    it("should resolve with undefined data and error", async () => {
      const testPromise = Promise.reject(new Error("test_error"));
      const result = await promiseMe(testPromise);
      expect(result).to.deep.equal([undefined, new Error("test_error")]);
    });

    it("should resolve with undefined data and error for a failing promise", async () => {
      const testPromise = new Promise((resolve, reject) => {
        throw new Error("test_error");
      });
      const result = await promiseMe(testPromise);
      expect(result).to.deep.equal([undefined, new Error("test_error")]);
    });
  });
});
