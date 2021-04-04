import { createServer, createServerOptions } from "../server";
let server: any = {};

const start = async () => {
  const options: createServerOptions = {
    serverOptions: {
      port: 5000,
      host: process.env.HOST || "127.0.0.1",
    },
    options: {
      //app_key_auth: "SecretTests",
      jwt_secret: "SecretTests",
      swaggerOptions: {
        info: {
          title: "Test API",
          version: "1.0",
          contact: {
            name: "todo test",
            email: "tester@test.com",
          },
        },
        schemes: [process.env.SSL === "true" ? "https" : "http"],
        grouping: "tags",
      },
      routeOptions: {
        routes: "**/routes/*.js",
      },
    },
  };
  server = await createServer(options);
  await server.start();
}
start();
