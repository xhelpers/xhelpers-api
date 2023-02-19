import * as mongoose from "mongoose";

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
  try {
    const defaultOptions: any = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ...options.connectionOptions,
    };

    await mongoose.connect(options.uri, defaultOptions);

    console.log(`🆙  Connected to mongodb: ${mongoose.version}`);
  } catch (err) {
    handleFailedConnection(err, options);
  }
  return null;
};

const handleFailedConnection = (err: any, options: options) => {
  console.error(
    `📴 Failed to connect on mongodb: ${mongoose.version}\nErr: ${err}`
  );
  setTimeout(async () => {
    await connect(options);
  }, 5000);
};
export { mongoose };
