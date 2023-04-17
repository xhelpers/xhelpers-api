import * as Hapi from "@hapi/hapi";
import { IServiceJob } from "../plugins/cron-jobs";
import { ICronJob } from "../config";

export default class BaseCronJobService implements IServiceJob {
  jobService: IServiceJob;

  constructor(server: Hapi.Server) {
    this.jobService = this.getServiceFromServer(server);
  }

  private getServiceFromServer(server: Hapi.Server): IServiceJob {
    const { plugins }: any = server;
    return plugins["cronjobs"].service;
  }

  public async addJob(job: ICronJob) {
    this.jobService.addJob(job);
  }

  public async removeJob(jobName: string) {
    this.jobService.removeJob(jobName);
  }
}

export { ICronJob, IServiceJob };
