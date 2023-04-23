import { Boom } from "../tools";
import { errorHandler } from "./error-handler";
import { promiseMe } from "./promise-me";
import { log, logger } from "../utils";

export const safeCall = async (
  request: {
    method: any;
    path: any;
    auth: { credentials: { user: any }; token: any };
  },
  action: { (user: any): Promise<any>; (arg0: any): Promise<any> }
) => {
  if (typeof action !== "function") {
    throw "Parameter 'action' must be a function.";
  }
  const displayLog = process.env.NODE_ENV === "DEV";

  try {
    if (displayLog) {
      console.time("| 5️⃣ | SafeCall time");
      log(`| 1️⃣ | Route: ${request.method}  ${request.path}`);
      console.time("| 2️⃣ | Auth time");
    }

    const user =
      request.auth && request.auth.credentials && request.auth.credentials.user;

    if (user) user.token = request?.auth?.token;
    if (user?._id) user.id = user._id;

    if (displayLog) {
      console.timeEnd("| 2️⃣ | Auth time");
      log(`| 3️⃣ | User: ${user && user.email} id: ${user && user.id}`);
      console.time("| 4️⃣ | Function time");
    }

    const [result, resultErr] = await promiseMe(action(user));

    if (displayLog) console.timeEnd("| 4️⃣ | Function time");

    if (resultErr) throw resultErr;

    return Promise.resolve(result).then((r) => {
      if (displayLog) log(`| 6️⃣  🎲 | StatusCode: ${r.statusCode}`);
      return r;
    });
  } catch (error: any) {
    if (displayLog) logger("error", `|❗️ 🔥 |${error?.message}`, error);
    return errorHandler(error);
  } finally {
    if (displayLog) console.timeEnd("| 5️⃣ | SafeCall time");
  }
};
