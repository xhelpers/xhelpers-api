import { uuid } from "../tools";
import { envIsTest } from "../config";

export const logger = async (
  type: "error" | "err" | "log" | "info",
  message: string,
  data: any
) => {
  if (envIsTest) return;

  function error() {
    const logGuid = uuid.v4();
    console.error(`| 🔥 |- \t[${logGuid}]`);
    console.error(`| Type: ${data.name} - ${message}`, data);
    console.error(`| 🔥 |- \t[${logGuid}]`);
  }

  function log() {
    console.log(message, data || "");
  }

  switch (type) {
    case "error":
    case "err":
      error();
      break;
    case "info":
    case "log":
    default:
      log();
      break;
  }
};

export const log = async (message: string, data?: any) => {
  logger("log", message, data);
};
