import * as mongoose from "mongoose";

import { ConnectionString } from "connection-string";

export interface options {
  uri: string;
  connectionOptions?: any;
  [key: string]: any;
}

export const connect = async (options?: options | undefined) => {
  const envIsNotTest = process.env.NODE_ENV !== "TEST";

  if (!options) {
    if (envIsNotTest) console.log("Settings API: Mongoose disabled;");
    return;
  }
  if (envIsNotTest) console.log("Settings API: Mongoose enabled;");
  const connectionString = new ConnectionString(options.uri);
  try {
    const defaultOptions: any = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ...options.connectionOptions,
    };

    await mongoose.connect(options.uri, defaultOptions);

    console.log(
      `🆙  Connected to mongodb: ${mongoose.version}/${connectionString.protocol}://${connectionString.user}:xxxxx@${connectionString.host}`
    );
  } catch (err) {
    handleFailedConnection(connectionString, err, options);
  }
  return null;
};

const handleFailedConnection = (
  connectionString: any,
  err: any,
  options: options
) => {
  console.error(
    `📴 Failed to connect on mongodb: ${mongoose.version}/${connectionString.protocol}://${connectionString.user}:xxxxx@${connectionString.host}\nErr: ${err}`
  );
  setTimeout(async () => {
    await connect(options);
  }, 5000);
};
