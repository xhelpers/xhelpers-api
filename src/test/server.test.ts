import { createServer } from "../server";
let server: any = {};

async function start() {
  const options: any = {
    serverOptions: {
      port: 5000,
      host: process.env.HOST || "127.0.0.1",
    },
    options: {
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
