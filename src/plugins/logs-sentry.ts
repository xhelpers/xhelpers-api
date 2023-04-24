import { Server } from "@hapi/hapi";
import { IOptions, ISentryOptions } from "../config";
import { log } from "../utils";

import * as Sentry from "@sentry/node";
const HapiSentry = require("hapi-sentry");

async function setUpSentry(server: Server, options: ISentryOptions) {
  // parse options
  const defaultOptions = {
    ignoreStatusCode: [401, 404],
    ignoreRoutes: ["/{p*}"],
    remoteAddressHeader: "x-forwarded-for",
    version: "unknown",
  };
  const parsedOptions = {
    ...defaultOptions,
    ...options,
  };

  server.register({
    plugin: HapiSentry,
    options: {
      client: {
        dsn: parsedOptions.dsn,
      },
      catchLogErrors: true,
    },
  });

  server.ext({
    type: "onPreResponse",
    method(request, h) {
      const response = request.response as any;
      const isBoom = response.isBoom;
      const ignoreStatusCode = parsedOptions.ignoreStatusCode.includes(
        response.output?.statusCode
      );
      const ignoreRoutes = parsedOptions.ignoreRoutes.includes(
        request.route.path
      ); // incluir "/{p*}" no array para ignorar rotas que não existem
      const remoteAddress =
        request.headers[parsedOptions.remoteAddressHeader] ||
        request.info?.remoteAddress;
      const host = request.headers.host;
      if (isBoom && !ignoreStatusCode && !ignoreRoutes) {
        log("Sending error to Sentry");
        Sentry.withScope((scope: any) => {
          const payloadString =
            request.payload && JSON.stringify(request.payload);
          scope.setExtra(
            "payload",
            request.payload && JSON.parse(payloadString)
          );
          scope.setExtra("rawPayload", request.payload && payloadString);
          scope.setExtra("route", request.route.path);
          scope.setExtra("user", request.auth?.credentials?.user);
          scope.setExtra("remoteAddress", remoteAddress);
          scope.setExtra("host", host);
          scope.setExtra("headers", request.headers);
          scope.setExtra("method", request.method);

          scope.addEventProcessor((sentryEvent: any) => {
            // sentryEvent.level = Sentry.Severity.Error;
            scope.setLevel("error");

            // some SDK identificator
            sentryEvent.sdk = {
              name: "sentry.javascript.node.hapi",
              version: parsedOptions.version,
            };
            return sentryEvent;
          });

          Sentry.captureException(request.response);
        });
      }
      return h.continue;
    },
  });
  return server;
}

export const registerSentry = async (server: Server, options: IOptions) => {
  const sentryDSN = options.sentryOptions?.dsn || process.env.SENTRY_DSN;
  if (!sentryDSN) {
    log("Settings API: Sentry disabled;");
    return;
  }

  log("Settings API: Sentry enabled;");
  await setUpSentry(server, {
    ...options.sentryOptions,
    dsn: sentryDSN,
    version: options.swaggerOptions?.info?.version || "1",
  });
};
