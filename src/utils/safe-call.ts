import { errorHandler } from "./error-handler";
import { promiseMe } from "./promise-me";
import { log, logger } from "../utils";
import { envIsTest } from "../config";

const displayLog = process.env.NODE_ENV === "DEV" || true;

const logWithTime = (label: string, message?: string) => {
  if (envIsTest()) return;
  if (!displayLog) return;
  console.time(label);
  if (message) log(message);
};

const logTimeEnd = (label: string) => {
  if (envIsTest()) return;
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

  const infoId = request.info?.id || "";
  const authLabel = "|2| Auth time " + infoId;
  const functionLabel = "|4| Function time " + infoId;
  const safeCallLabel = "|5| SafeCall time " + infoId;

  logWithTime(
    safeCallLabel,
    `|1| Route: ${request.method} ${request.path} - ${infoId}`
  );
  logWithTime(authLabel);

  const { credentials } = request?.auth || {};
  const user = credentials?.user || credentials;
  if (typeof user === "object" && user !== null) {
    user.id = user?.id || user?._id;
    user.token = request?.auth?.token;
  }

  logTimeEnd(authLabel);

  try {
    logWithTime(
      functionLabel,
      `|3| User: ${user?.email || ""} id: ${user?.id || ""} - ${infoId}`
    );

    const [result, resultErr] = await promiseMe(action(user));

    logTimeEnd(functionLabel);

    if (resultErr) throw resultErr;

    return Promise.resolve(result).then((r) => {
      if (displayLog) log(`|6| StatusCode: ${r?.status || r?.statusCode}`);
      return r;
    });
  } catch (error: any) {
    if (displayLog) logger("error", `|❗️ |${error?.message}`, error);
    return errorHandler(error);
  } finally {
    logTimeEnd(safeCallLabel);
  }
};
