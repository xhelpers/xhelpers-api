import * as uuid from "uuid";

export const logger = async (type: string, message: string, data: any) => {
  switch (type) {
    case "info":
    case "log":
      console.log(message, data);
      break;
    case "err":
      const logGuid = uuid.v4();
      console.error(`| 🔥 |- \t[${logGuid}]`);
      console.error(
        `| 🔥 | Type: ${data.name} - ${message}`,
        JSON.stringify(data),
        data
      );
      console.error(`| 🔥 |- \t[${logGuid}]`);
      break;
    default:
      console.log(message);
      break;
  }
}
