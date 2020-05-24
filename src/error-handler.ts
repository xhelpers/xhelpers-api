import * as Boom from "@hapi/boom";

import { logger } from "./logger";

export const errorHandler = async(err: any) => {
  logger("err", "LogInfo:", err);
  if (process.env.LOGLEVEL === "HIGH") {
    logger("info", "Info:", err);
  }
  if (Boom.isBoom(err)) {
    return err;
  }
  if (typeof err === "string") {
    // custom application error
    const error = new Error(err);
    return Boom.boomify(error, { statusCode: 400 });
  }
  if (err.name === "MongoError") {
    // mongodb error
    return Boom.boomify(err, {
      message: `Bad request ${err.code}-${err.errmsg}`,
      statusCode: 400
    });
  }
  if (err.name === "JsonWebTokenError") {
    // invalid token
    return Boom.boomify(err, {
      message: "Authorization error",
      statusCode: 401
    });
  }
  if (err.name === "Error") {
    // custom application error
    const error = new Error(err.message);
    return Boom.boomify(error, { statusCode: 400 });
  }
  if (err.name === "ValidationError") {
    // mongoose validation error
    return Boom.boomify(err, { statusCode: 400 });
  }
  if (err.name === "UnauthorizedError") {
    // jwt authentication error
    return Boom.boomify(err, { message: "Invalid Token", statusCode: 401 });
  }
  // default to 500 server error
  return Boom.boomify(err, {
    message: err.message,
    statusCode: 500,
    override: true
  });
}
