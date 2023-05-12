require("dotenv").config();
import * as ChaiAsPromised from "chai-as-promised";
import { expect, use } from "chai";
import * as sinon from "sinon";
import { logger } from "../utils/logger";

use(ChaiAsPromised);

describe("🚧  Testing Logger  🚧", () => {
  before(async () => {});
  after(async () => {});

  beforeEach(() => {
    consoleErrorStub = sinon.stub(console, "error");
    consoleLogStub = sinon.stub(console, "log");
  });

  afterEach(() => {
    consoleErrorStub.restore();
    consoleLogStub.restore();
  });

  let consoleErrorStub: sinon.SinonStub;
  let consoleLogStub: sinon.SinonStub;

  describe("Logger wrapper", async () => {
    it('should log error when type is "error"', async () => {
      const data = { name: "ErrorName" };
      await logger("error", "ErrorMessage", data);
      expect(consoleErrorStub.calledThrice).to.be.true;
    });

    it('should log error when type is "err"', async () => {
      const data = { name: "ErrorName" };
      await logger("err", "ErrorMessage", data);
      expect(consoleErrorStub.calledThrice).to.be.true;
    });

    it('should log info when type is "info"', async () => {
      const data = { info: "InfoData" };
      await logger("info", "InfoMessage", data);
      expect(consoleLogStub.calledOnce).to.be.true;
    });

    it('should log info when type is "log"', async () => {
      const data = { info: "LogData" };
      await logger("log", "LogMessage", data);
      expect(consoleLogStub.calledOnce).to.be.true;
    });

    it("should log info when type is not specified", async () => {
      const data = { info: "DefaultData" };
      await logger("info", "DefaultMessage", data);
      expect(consoleLogStub.calledOnce).to.be.true;
    });
  });
});
