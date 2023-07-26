import { expect } from "chai";
import BaseCronJobService from "../service/base-cronjobs";
const sinon = require("sinon");

describe("🚧  Testing service BaseCronJobService", () => {
  describe("addJob", () => {
    it("should call the jobService.addJob method with the provided job", () => {
      // Arrange
      const job = {
        name: "teste-job-name",
        time: `30 * * * *`, // Default: 'At minute 30.'
        timezone: "America/Sao_Paulo",
        request: {
          method: "GET",
          url: "/health",
        },
        onComplete: async (res: any) => {
          return res;
        },
      };
      const jobServiceMock = {
        addJob: sinon.spy(),
      };
      const baseCronJobService = new BaseCronJobService({
        plugins: { cronjobs: { service: jobServiceMock } },
      } as any);

      // Act
      baseCronJobService.addJob(job);

      // Assert
      sinon.assert.calledWith(jobServiceMock.addJob, job);
    });
  });

  describe("removeJob", () => {
    it("should call the jobService.removeJob method with the provided job name", () => {
      // Arrange
      const jobName = "teste-job-name";
      const jobServiceMock = {
        removeJob: sinon.spy(),
      };
      const baseCronJobService = new BaseCronJobService({
        plugins: { cronjobs: { service: jobServiceMock } },
      } as any);

      // Act
      baseCronJobService.removeJob(jobName);

      // Assert
      sinon.assert.calledWith(jobServiceMock.removeJob, jobName);
    });
  });
});
