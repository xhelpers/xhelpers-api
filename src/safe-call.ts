import * as Boom from "boom";

import handleError from "./error-handler";
import { promiseMe } from "./promise-me";

export default async function safeCall(
  request: { method: any; path: any; auth: { credentials: { user: any } } },
  action: { (user: any): Promise<any>; (arg0: any): Promise<any> }
) {
  if (typeof action !== "function") {
    throw 'Parameter "action" must be a function.';
  }
  console.time(`| 5️⃣ | SafeCall time`);
  try {
    console.log("| 1️⃣ | Route:", request.method, request.path);

    console.time(`| 2️⃣ | Auth time`);
    await ensureAuthentication(request);
    const user =
      request.auth && request.auth.credentials && request.auth.credentials.user;
    console.timeEnd(`| 2️⃣ | Auth time`);
    console.log("| 3️⃣ | User:", user && user.email, "id:", user && user.id);

    console.time(`| 4️⃣ | Function time`);
    let [result, resultErr] = await promiseMe(action(user));
    if (resultErr) throw resultErr;
    console.timeEnd(`| 4️⃣ | Function time`);

    return Promise.resolve(result).then(r => {
      console.log("| 6️⃣  🎲 | StatusCode:", r.statusCode);
      return r;
    });
  } catch (error) {
    console.error("|❗️ 🔥 |", error.message, JSON.stringify(error));
    return handleError(error);
  } finally {
    console.timeEnd(`| 5️⃣ | SafeCall time`);
  }
}

async function ensureAuthentication(request: {
  method?: any;
  path?: any;
  auth: any;
}) {
  if (!request.auth.isAuthenticated) {
    const { message } = request.auth.error || "Auth failed";
    return Boom.unauthorized("Authentication failed due to: " + message);
  }
}
