import { expect } from "chai";
import BaseAxiosService, { IRetryOptions } from "../service/base-http-axios";

class AxiosService extends BaseAxiosService {
  constructor(retryOptions?: IRetryOptions) {
    super(retryOptions);
  }
}

function createAxiosService(retryOptions?: IRetryOptions): AxiosService {
  const axiosService = new AxiosService(retryOptions);
  return axiosService;
}

describe("🚧  Testing service BaseAxiosService", () => {
  describe("retryOptions", () => {
    it("should set default retry options if not provided", () => {
      const axiosService = createAxiosService();
      expect(axiosService["retryOptions"].retries).to.equal(3);
      expect(axiosService["retryOptions"].shouldResetTimeout).to.be.true;
      expect(axiosService["retryOptions"].retryDelay(2)).to.equal(10_000);
      expect(axiosService["retryOptions"].retryCondition({ message: "error" }))
        .to.be.true;
    });

    it("should merge provided retry options with default options", () => {
      const retryOptions: IRetryOptions = {
        retries: 5,
        shouldResetTimeout: true,
        retryDelay: (retryCount: number) => retryCount * (1000 * 2), // 2 seconds between retries
        retryCondition: (error: any) => false, // never retry
      };
      const axiosService = createAxiosService(retryOptions);
      expect(axiosService["retryOptions"].retries).to.equal(5);
      expect(axiosService["retryOptions"].shouldResetTimeout).to.be.true;
      expect(axiosService["retryOptions"].retryDelay(3)).to.equal(6_000);
      expect(axiosService["retryOptions"].retryCondition({ message: "error" }))
        .to.be.false;
    });
  });

  describe("setAxiosDefaults", () => {
    it("should set default Axios options", () => {
      const axiosService = createAxiosService();
      const axiosInstance = axiosService["axios"];
      expect(axiosInstance.defaults.timeout).to.equal(1000 * 60);

      expect(
        axiosInstance.defaults.validateStatus &&
          axiosInstance.defaults.validateStatus(200)
      ).to.be.true;
      expect(
        axiosInstance.defaults.validateStatus &&
          axiosInstance.defaults.validateStatus(500)
      ).to.be.false;
    });
  });

  describe("defaultCatch", () => {
    // Since defaultCatch only logs the errors, we can't make specific assertions on it.
    // We can simply test that it doesn't throw any errors.
    it("should not throw any errors", () => {
      const axiosService = createAxiosService();
      expect(() =>
        axiosService.defaultCatch({ response: "error" })
      ).to.not.throw();
      expect(() =>
        axiosService.defaultCatch({ request: "error" })
      ).to.not.throw();
      expect(() =>
        axiosService.defaultCatch(new Error("Test error"))
      ).to.not.throw();
    });
  });

  describe("logResponse", () => {
    it("should log the response data when LOG_LEVEL is HIGH", () => {
      // Save the original value of LOG_LEVEL
      const originalLogLevel = process.env.LOG_LEVEL;
      process.env.LOG_LEVEL = "HIGH";

      // Mock the log function to capture the logs
      const logs: any[] = [];
      const originalLog = console.log;
      console.log = (...args: any[]) => {
        logs.push(args);
      };

      const axiosService = createAxiosService();
      axiosService.logResponse({
        config: { url: "http://example.com", method: "GET", data: {} },
        status: 200,
        data: { message: "success" },
      });

      // Restore the log function and LOG_LEVEL
      console.log = originalLog;
      process.env.LOG_LEVEL = originalLogLevel;

      // Make assertions on the logs captured
      expect(logs).to.have.lengthOf(2);
      expect(logs[0][0]).to.include("Config");
      expect(logs[1][0]).to.include(
        'Response API - status: 200 - data: {"message":"success"}'
      );
    });

    it("should not log the response data when LOG_LEVEL is not HIGH", () => {
      // Save the original value of LOG_LEVEL
      const originalLogLevel = process.env.LOG_LEVEL;
      process.env.LOG_LEVEL = "LOW";

      // Mock the log function to capture the logs
      const logs: any[] = [];
      const originalLog = console.log;
      console.log = (...args: any[]) => {
        logs.push(args);
      };

      const axiosService = createAxiosService();
      axiosService.logResponse({
        config: { url: "http://example.com", method: "GET", data: {} },
        status: 200,
        data: { message: "success" },
      });

      // Restore the log function and LOG_LEVEL
      console.log = originalLog;
      process.env.LOG_LEVEL = originalLogLevel;

      // Make assertions on the logs captured (should be empty)
      expect(logs).to.have.lengthOf(0);
    });
  });
});
