import * as mongoose from "mongoose";
import { IMongooseOptions } from "../config";
import { log, logger } from "../utils";

export const connect = async (options?: IMongooseOptions | undefined) => {
  if (!options) {
    log("Settings API: Mongoose disabled;");
    return;
  }
  log("Settings API: Mongoose enabled;");
  try {
    const defaultOptions: any = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ...options.connectionOptions,
    };

    mongoose.set("strictQuery", defaultOptions.strictQuery || false);
    await mongoose.connect(options.uri, defaultOptions);

    log(`🆙  Connected to mongodb: ${mongoose.version}`);
  } catch (err) {
    handleFailedConnection(err, options);
  }
  return null;
};

const handleFailedConnection = (err: any, options: IMongooseOptions) => {
  logger("error", `📴 Failed to connect on mongodb: ${mongoose.version}`, err);
  setTimeout(async () => {
    await connect(options);
  }, 5000);
};
export { mongoose };
