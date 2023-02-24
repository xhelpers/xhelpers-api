import { CronJob } from "cron";

const pluginName = "cronjobs";

export interface ICronJob {
  name: string;
  time: string;
  timezone: string;
  request: {
    method: string;
    url: string;
    params?: any;
    query?: any;
    payload?: any;
    headers?: any;
    [key: string]: any;
  };
  onComplete: (res: any) => void;
}

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
      console.error(invalid, error);
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
      console.log("Job created: ", job.name);
    }
  } catch (err: any) {
    if (err.message === "Invalid timezone.") {
      console.log(
        err,
        "Invalid timezone. See https://momentjs.com/timezone for valid timezones"
      );
    } else {
      console.log(err, "Time is not a cron expression");
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
    console.log(err);
  }
};

const register = (server: any, options: any) => {
  server.expose("service", {
    addJob: (job: ICronJob) => addJob(job, server),
    removeJob: (name: string) => removeJob(name, server),
  });
  server.ext("onPostStart", internals.onPostStart(server));
  server.ext("onPreStop", internals.onPreStop(server));
};

exports.plugin = {
  register,
  name: pluginName,
};
