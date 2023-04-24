import { Server } from "@hapi/hapi";
import { IOptions } from "../config";
import { log, logger } from "../utils";

import { CronJob } from "cron";
import { ICronJob } from "../config/cronjobs";

const pluginName = "cronjobs";

export interface IServiceJob {
  addJob: (job: ICronJob) => void;
  removeJob: (name: string) => void;
}

const internals = {
  trigger: (server: any, job: ICronJob) => {
    return async () => {
      server.log([pluginName], job.name);
      if (process.env.LOG_LEVEL === "HIGH") {
        console.log("Triggered job: ", job.name);
      }
      const res = await server.inject(job.request);
      if (job.onComplete) {
        job.onComplete(res.result);
      }
    };
  },
  onPostStart: (server: any) => {
    return () => {
      const service: any = getService(server);
      for (const key of Object.keys(service)) {
        if (internals.invalidKeys.includes(key)) return;
        service[key].start();
      }
    };
  },
  onPreStop: (server: any) => {
    return () => {
      const service: any = getService(server);
      for (const key of Object.keys(service)) {
        if (internals.invalidKeys.includes(key)) return;
        service[key].stop();
      }
    };
  },
  invalidKeys: ["addJob", "removeJob"],
};

function getService(server: any): any {
  return server.plugins[pluginName].service || {};
}

const addJob = (job: ICronJob, server: any) => {
  const service: any = getService(server);

  const assert = (invalid: any, error: string) => {
    if (invalid) {
      logger("error", invalid, error);
    }
    return invalid;
  };

  if (assert(!!service[job.name], "Job name has already been defined")) return;
  if (assert(!job.name, "Missing job name")) return;
  if (assert(!job.time, "Missing job time")) return;
  if (assert(!job.timezone, "Missing job time zone")) return;
  if (assert(!job.request, "Missing job request options")) return;
  if (assert(!job.request.url, "Missing job request url")) return;
  if (
    assert(
      typeof !job.onComplete === "function" ||
        typeof !job.onComplete === "undefined",
      "onComplete value must be a function"
    )
  )
    return;

  try {
    service[job.name] = new CronJob(
      job.time,
      internals.trigger(server, job),
      null,
      false,
      job.timezone
    );
    service[job.name].start();
    if (process.env.LOG_LEVEL === "HIGH") {
      log("Job created: ", job.name);
    }
  } catch (err: any) {
    if (err.message === "Invalid timezone.") {
      logger(
        "error",
        "Invalid timezone. See https://momentjs.com/timezone for valid timezones",
        err
      );
    } else {
      logger("error", "Time is not a cron expression", err);
    }
  }
};

const removeJob = (name: string, server: any) => {
  if (internals.invalidKeys.includes(name)) return;

  const service: any = getService(server);
  try {
    if (service[name]) {
      service[name].stop();
      delete service[name];
    }
  } catch (err: any) {
    logger("error", err.message, err);
  }
};

const register = (server: any, options: any) => {
  server.expose("service", {
    addJob: (job: ICronJob) => addJob(job, server),
    removeJob: (name: string) => removeJob(name, server),
  });

  // server.events.on("addJob", (job: ICronJob) => {
  //   addJob(job, server);
  // });
  // server.events.on("removeJob", (name: string) => {
  //   removeJob(name, server);
  // });

  server.ext("onPostStart", internals.onPostStart(server));
  server.ext("onPreStop", internals.onPreStop(server));
};

const cronJobPlugin = {
  name: pluginName,
  version: "1.0.0",
  register,
};

export const registerCronJobs = async (server: Server, options: IOptions) => {
  // CronJobs
  if (!options.enableCronJobs) {
    log("Settings API: CronJobs disabled;");
    return;
  }

  log("Settings API: CronJobs enabled;");
  await server.register(cronJobPlugin);
};
