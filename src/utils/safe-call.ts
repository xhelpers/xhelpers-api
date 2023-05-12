import { errorHandler } from "./error-handler";
import { promiseMe } from "./promise-me";
import { log, logger } from "../utils";

const displayLog = process.env.NODE_ENV === "DEV" || true;

const logWithTime = (label: string, message?: string) => {
  if (!displayLog) return;
  console.time(label);
  if (message) log(message);
};

const logTimeEnd = (label: string) => {
  if (!displayLog) return;
  console.timeEnd(label);
};

export const safeCall = async (
  request: {
    method: any;
    path: any;
    auth: { credentials: { user: any }; token: any };
    [key: string]: any;
  },
  action: { (user: any): Promise<any>; (arg0: any): Promise<any> }
) => {
  if (typeof action !== "function") {
    throw "Parameter 'action' must be a function.";
  }

  logWithTime(
    "|5| SafeCall time",
    `|1| Route: ${request.method}  ${request.path} - ${request.id}`
  );
  logWithTime("|2| Auth time");

  const { credentials } = request?.auth || {};
  const user = credentials?.user || credentials;
  if (user) {
    user.id = user?.id || user?._id;
    user.token = request?.auth?.token;
  }

  logTimeEnd("|2| Auth time");
  logWithTime(
    "|4| Function time",
    `|3| User: ${user?.email || ""} id: ${user?.id || ""}`
  );

  try {
    const [result, resultErr] = await promiseMe(action(user));

    logTimeEnd("|4| Function time");

    if (resultErr) throw resultErr;

    return Promise.resolve(result).then((r) => {
      if (displayLog) log(`|6| StatusCode: ${r.status || r.statusCode}`);
      return r;
    });
  } catch (error: any) {
    if (displayLog) logger("error", `|❗️ |${error?.message}`, error);
    return errorHandler(error);
  } finally {
    logTimeEnd("|5| SafeCall time");
  }
};
