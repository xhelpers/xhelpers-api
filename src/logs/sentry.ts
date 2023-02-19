import { Server } from "@hapi/hapi";
// import * as Sentry from "@sentry/node";
// const HapiSentry = require("hapi-sentry");
const HapiSentry: any = {
  Severity: {
    Error: {},
  },
};

export interface SentryOptions {
  dsn: string;
  ignoreStatusCode?: number[];
  ignoreRoutes?: string[];
  remoteAddressHeader?: string;
  version?: string;
}

export function setUpSentry(server: Server, options: SentryOptions) {
  // todo: not ready for hapi21+ and node18
  // const HapiSentry = require("hapi-sentry");
  console.log("Hapi sentry disabled, for version 4+");
  return;
  // parse options
  // const defaultOptions = {
  //   ignoreStatusCode: [401, 404],
  //   ignoreRoutes: ["/{p*}"],
  //   remoteAddressHeader: "x-forwarded-for",
  //   version: "unknown",
  // };
  // const parsedOptions = {
  //   ...defaultOptions,
  //   ...options,
  // };

  // server.register({
  //   plugin: HapiSentry,
  //   options: {
  //     client: {
  //       dsn: parsedOptions.dsn,
  //     },
  //     catchLogErrors: true,
  //   },
  // });

  // server.ext({
  //   type: "onPreResponse",
  //   method(request, h) {
  //     const response = request.response as any;
  //     const isBoom = response.isBoom;
  //     const ignoreStatusCode = parsedOptions.ignoreStatusCode.includes(
  //       response.output?.statusCode
  //     );
  //     const ignoreRoutes = parsedOptions.ignoreRoutes.includes(
  //       request.route.path
  //     ); // incluir "/{p*}" no array para ignorar rotas que não existem
  //     const remoteAddress =
  //       request.headers[parsedOptions.remoteAddressHeader] ||
  //       request.info?.remoteAddress;
  //     const host = request.headers["host"];
  //     if (isBoom && !ignoreStatusCode && !ignoreRoutes) {
  //       console.log("Sending error to Sentry");
  //       Sentry.withScope((scope: any) => {
  //         const payloadString =
  //           request.payload && JSON.stringify(request.payload);
  //         scope.setExtra(
  //           "payload",
  //           request.payload && JSON.parse(payloadString)
  //         );
  //         scope.setExtra("rawPayload", request.payload && payloadString);
  //         scope.setExtra("route", request.route.path);
  //         scope.setExtra("user", request.auth?.credentials?.user);
  //         scope.setExtra("remoteAddress", remoteAddress);
  //         scope.setExtra("host", host);
  //         scope.setExtra("headers", request.headers);
  //         scope.setExtra("method", request.method);

  //         scope.addEventProcessor((sentryEvent: any) => {
  //           // sentryEvent.level = Sentry.Severity.Error;
  //           scope.setLevel("error");

  //           // some SDK identificator
  //           sentryEvent.sdk = {
  //             name: "sentry.javascript.node.hapi",
  //             version: parsedOptions.version,
  //           };
  //           return sentryEvent;
  //         });

  //         Sentry.captureException(request.response);
  //       });
  //     }
  //     return h.continue;
  //   },
  // });
  // return server;
}
