import { AxiosStatic } from "axios";
import { axios } from "../tools";
import { log } from "../utils";

import axiosRetry from "axios-retry";

export interface IRetryOptions {
  retries: number;
  shouldResetTimeout: true;
  retryDelay: (retryCount: number) => number;
  retryCondition: (error: any) => boolean;
}

export default abstract class AxiosService {
  protected axios: AxiosStatic;

  constructor(retryOptions?: IRetryOptions) {
    this.axios = axios;
    this.setAxiosDefaults();
    this.retryOptions = { ...this.retryOptions, ...retryOptions };
  }

  retryOptions: IRetryOptions = {
    retries: 3,
    shouldResetTimeout: true,
    retryDelay: (retryCount: number) => {
      log(`[Axios] Retry attempt: ${retryCount}`);
      return retryCount * (1000 * 5); // 5sec * retry - time interval between retries
    },
    retryCondition: (error: any) => {
      // if retry condition is not specified, by default idempotent requests are retried
      const { message } = error;
      log(`[Axios] Retry error: ${message}`);
      return true;
    },
  };

  protected setAxiosDefaults() {
    this.axios.defaults.timeout = 1000 * 60; // 60s response timeout
    this.axios.defaults.validateStatus = function (status: number) {
      const isValid = status < 500;
      if (!isValid) {
        log("[Axios] API StatusCode", status);
      }
      return isValid;
    };
    axiosRetry(this.axios, this.retryOptions);
  }

  defaultCatch(error: any) {
    if (error.response) {
      log(
        "[Axios] The request was made and the server responded with a status code that falls out of the range"
      );
    } else if (error.request) {
      log("[Axios] The request was made but no response was received");
    } else {
      log(
        "[Axios] Error Something happened in setting up the request that triggered an Error",
        error.message
      );
    }
  }

  logResponse = (response: any) => {
    const logLevel = process.env.LOG_LEVEL || "HIGH";
    if (logLevel === "HIGH") {
      log("[Axios] \n📝 Config", {
        url: response.config.url,
        method: response.config.method,
        data: response.config.data,
        params: response.config.params,
        headers: response.config.headers,
      });

      log(
        `[Axios] \nResponse API - status: ${
          response.status
        } - data: ${JSON.stringify(response.data)}\n`
      );
    }
  };
}
