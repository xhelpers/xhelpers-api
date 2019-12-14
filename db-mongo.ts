import * as mongoose from "mongoose";

export default async function connect() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.log("Settings API: Mongodb disabled;");
    return;
  }
  try {
    const options: mongoose.ConnectionOptions = {
      useCreateIndex: true,
      useNewUrlParser: true
    };
    return await mongoose.connect(mongoUri, options).then(
      () => {
        //mongoose.Promise = global.Promise;
        console.log(
          `🆙  Connected to mongodb: ${mongoose.version}/${mongoUri}`
        );
      },
      err => {
        console.error(
          `📴 Failed to connect on mongodb: ${mongoose.version}/${mongoUri}\nErr: ${err}`
        );
        setTimeout(async () => {
          await connect();
        }, 5000);
      }
    );
  } catch (err) {
    console.error(
      `📴 Failed to connect on mongodb: ${mongoose.version}/${mongoUri}\nErr: ${err}`
    );
    setTimeout(async () => {
      await connect();
    }, 5000);
  }
  return null;
}
