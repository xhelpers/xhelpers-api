import * as uuid from "uuid";

export const logger = async (type: string, message: string, data: any) => {
  switch (type) {
    case "err":
      error();
      break;
    case "info":
    case "log":
    default:
      log();
      break;
  }

  function error() {
    const logGuid = uuid.v4();
    console.error(`| 🔥 |- \t[${logGuid}]`);
    console.error(`| Type: ${data.name} - ${message}`, data);
    console.error(`| 🔥 |- \t[${logGuid}]`);
  }

  function log() {
    console.log(message, data);
  }
};
