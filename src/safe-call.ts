import * as Boom from "@hapi/boom";

import { errorHandler } from "./error-handler";
import { promiseMe } from "./promise-me";

export const safeCall = async (
  request: { method: any; path: any; auth: { credentials: { user: any } } },
  action: { (user: any): Promise<any>; (arg0: any): Promise<any> }
) => {
  if (typeof action !== "function") {
    throw 'Parameter "action" must be a function.';
  }
  if (process.env.NODE_ENV !== "TEST") console.time(`| 5️⃣ | SafeCall time`);
  try {
    if (process.env.NODE_ENV !== "TEST")
      console.log("| 1️⃣ | Route:", request.method, request.path);

    if (process.env.NODE_ENV !== "TEST") console.time(`| 2️⃣ | Auth time`);
    await ensureAuthentication(request);
    const user =
      request.auth && request.auth.credentials && request.auth.credentials.user;
    if (process.env.NODE_ENV !== "TEST") console.timeEnd(`| 2️⃣ | Auth time`);
    if (process.env.NODE_ENV !== "TEST")
      console.log("| 3️⃣ | User:", user && user.email, "id:", user && user.id);

    if (process.env.NODE_ENV !== "TEST") console.time(`| 4️⃣ | Function time`);
    const [result, resultErr] = await promiseMe(action(user));
    if (resultErr) throw resultErr;
    if (process.env.NODE_ENV !== "TEST")
      if (process.env.NODE_ENV !== "TEST")
        console.timeEnd(`| 4️⃣ | Function time`);

    return Promise.resolve(result).then((r) => {
      if (process.env.NODE_ENV !== "TEST")
        console.log("| 6️⃣  🎲 | StatusCode:", r.statusCode);
      return r;
    });
  } catch (error) {
    console.error("|❗️ 🔥 |", error.message, JSON.stringify(error));
    return errorHandler(error);
  } finally {
    if (process.env.NODE_ENV !== "TEST")
      console.timeEnd(`| 5️⃣ | SafeCall time`);
  }
}

const ensureAuthentication = async (request: {
  method?: any;
  path?: any;
  auth: any;
}) => {
  if (!request.auth.isAuthenticated) {
    const { message } = request.auth.error || "Auth failed";
    return Boom.unauthorized("Authentication failed due to: " + message);
  }
}
