import * as ChaiAsPromised from "chai-as-promised";

import { expect, use } from "chai";

import { createServer } from "../server";

use(ChaiAsPromised);

let server: any = null;
let _todoId: string = "99100";
let _authToken: string;

const defaultMock = {
  title: "Test TODO",
  description: "Description of my todo",
  done: false,
};

describe("🚧  Resource api/todos  🚧", () => {
  before(async () => {
    const options: any = {
      serverOptions: {
        port: 5005,
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

    return Promise.resolve();
  });
  after(async () => {
    if (server) await server.stop();
    return Promise.resolve();
  });

  beforeEach(async () => {});
  afterEach(async () => {});

  describe("API api/todos", async () => {
    it("POST api/auth - should return 404 not found", async () => {
      const options = {
        method: "POST",
        url: "/api/auth",
      };
      const response = await server.inject(options);
      expect(response.statusCode).to.equal(404);
      return response;
    });

    it("GET api/auth - should return 200 with new token", async () => {
      const options = {
        method: "GET",
        url: "/api/auth",
      };
      const response = await server.inject(options);
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.be.a("object");
      expect(response.result.token).to.exist;

      _authToken = response.result.token;

      return response;
    });

    it("POST api/todos - should return 200 with new resource created", async () => {
      const options = {
        method: "POST",
        url: "/api/todos",
        payload: defaultMock,
      };
      const response = await server.inject(options);
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.be.a("object");
      expect(response.result.title).to.be.equals(defaultMock.title);
      expect(response.result.description).to.be.equals(defaultMock.description);
      expect(response.result.done).to.be.equals(defaultMock.done);

      return response;
    });

    it("POST api/todos - should return 400 and inform that the title is required", async () => {
      const options = {
        method: "POST",
        url: "/api/todos",
        payload: {
          ...defaultMock,
          title: "",
        },
      };
      const response = await server.inject(options);
      expect(response.statusCode).to.equal(400);
      expect(response.result).to.be.a("object");
      expect(response.result.message).to.be.equals(
        '"title" is not allowed to be empty'
      );
      return response;
    });

    it("POST api/todos - should return 400 and inform that the description is required", async () => {
      const options = {
        method: "POST",
        url: "/api/todos",
        payload: {
          ...defaultMock,
          description: "",
        },
      };
      const response = await server.inject(options);
      expect(response.statusCode).to.equal(400);
      expect(response.result).to.be.a("object");
      expect(response.result.message).to.be.equals(
        '"description" is not allowed to be empty'
      );
      return response;
    });

    it("PATCH api/todos/{id} - should return 200 with modified resource", async () => {
      const options = {
        method: "PATCH",
        url: `/api/todos/${_todoId}`,
        headers: {
          authorization: _authToken,
        },
        payload: defaultMock,
      };
      const response = await server.inject(options);
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.be.a("object");
      expect(response.result.title).to.be.equals(defaultMock.title);
      expect(response.result.description).to.be.equals(defaultMock.description);
      expect(response.result.done).to.be.equals(defaultMock.done);

      return response;
    });

    it("PATCH api/todos/{id} - should return 400 with not allowed keys message", async () => {
      const options = {
        method: "PATCH",
        url: `/api/todos/${_todoId}`,
        headers: {
          authorization: _authToken,
        },
        payload: {
          ...defaultMock,
          something: true,
        },
      };
      const response = await server.inject(options);
      expect(response.statusCode).to.equal(400);
      expect(response.result).to.be.a("object");
      expect(response.result.message).to.be.contains("is not allowed");

      return response;
    });

    it("PATCH api/todos/{id} - should return 401 unauthorized", async () => {
      const options = {
        method: "PATCH",
        url: `/api/todos/${_todoId}`,
        payload: {
          ...defaultMock,
          something: true,
        },
      };
      const response = await server.inject(options);
      expect(response.statusCode).to.equal(401);
      return response;
    });

    it("GET api/todos - should return 200 with one row", async () => {
      const response = await server.inject(
        `/api/todos?title=test&description=terr&done=false`
      );
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.be.a("array");
      expect(response.result).to.be.lengthOf(1);

      return response;
    });

    it("DELETE api/todos/{id} - should return 200", async () => {
      const options = {
        method: "DELETE",
        url: `/api/todos/${_todoId}`,
        headers: {
          authorization: _authToken,
        },
      };
      const response = await server.inject(options);
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.be.a("object");
      expect(response.result.id).to.be.eq(_todoId);

      return response;
    });

    it("DELETE api/todos/{id} - should return 401 unauthorized", async () => {
      const options = {
        method: "DELETE",
        url: `/api/todos/${_todoId}`,
      };
      const response = await server.inject(options);
      expect(response.statusCode).to.equal(401);
      expect(response.result).to.be.a("object");

      return response;
    });
  });
});
