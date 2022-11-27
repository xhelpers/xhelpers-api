import { AxiosStatic } from "axios";
import { axios } from "../tools";

const axiosRetry = require("axios-retry");

export default abstract class AxiosService {
  protected axios: AxiosStatic;

  constructor() {
    this.axios = axios;
    this.setAxiosDefaults();
  }

  protected setAxiosDefaults() {
    this.axios.defaults.timeout = 1000 * 60; // 60s response timeout
    this.axios.defaults.validateStatus = function (status: number) {
      const isValid = status < 500;
      if (!isValid) {
        console.log("API StatusCode", status);
      }
      return isValid;
    };
    axiosRetry(this.axios, {
      retries: 3, // number of retries
      shouldResetTimeout: true,
      retryDelay: (retryCount: number) => {
        console.log(`Retry attempt: ${retryCount}`);
        return retryCount * (1000 * 5); // 5sec * retry - time interval between retries
      },
      retryCondition: (error: any) => {
        // if retry condition is not specified, by default idempotent requests are retried
        const { message } = error;
        console.log(`Retry error: ${message}`);
        return true;
      },
    });
  }

  logResponse = (response: any) => {
    const logLevel = process.env.LOG_LEVEL || "HIGH";
    if (logLevel === "HIGH") {
      console.log("\n📝 Config", {
        url: response.config.url,
        method: response.config.method,
        data: response.config.data,
        params: response.config.params,
        headers: response.config.headers,
      });

      console.log(
        `\nResponse API - status: ${response.status} - data: ${JSON.stringify(
          response.data
        )}\n`
      );
    }
  };
}
