import { expect } from "chai";
import { Server } from "@hapi/hapi";
import { createServer } from "../server";
import { BaseRouteSimple } from "../route";
import { Joi } from "../tools";

const todoObject = { id: 999, name: "testing" };

class Routes extends BaseRouteSimple {
  constructor() {
    super(["simple-route"]);
    this.route("POST", "/todos", {}, false)
      .validate({
        payload: Joi.object({
          id: Joi.number(),
          name: Joi.string(),
        }),
      })
      .handler(async (r, h, u) => {
        expect(r.payload).to.deep.equal(todoObject);
        return h.response(r.payload).code(200);
      })
      .build();
    this.route("PATCH", "/todos/{id}", {}, false)
      .validate({
        params: this.defaultIdProperty,
        payload: Joi.object({
          id: Joi.number(),
          name: Joi.string(),
        }),
      })
      .handler(async (r, h, u) => {
        expect(r.payload).to.deep.equal(todoObject);
        return h.response(r.payload).code(200);
      })
      .build();
  }
}

describe("🚧  Testing Server route service", () => {
  let server: Server;

  beforeEach(async () => {
    const options: any = {
      serverOptions: {
        port: 3001,
      },
      options: {
        routeOptions: {
          routes: "",
        },
      },
    };

    server = await createServer(options);
    server.route(new Routes().buildRoutes());
    await server.start();
  });

  afterEach(async () => {
    await server.stop();
  });

  it("should accept POST and return it with status 200", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/todos",
      payload: todoObject,
    });

    expect(response.statusCode).to.equal(200);
    expect(response.result).to.deep.equal(todoObject);
  });

  it("should reject invalid POST and return status 400", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/todos",
      payload: { ...todoObject, extra: "shouldfail" },
    });

    expect(response.statusCode).to.equal(400);
    expect((response.result as any)?.message).to.be.equals(
      '"extra" is not allowed'
    );
  });

  it("should accept PATCH and return it with status 200", async () => {
    const response = await server.inject({
      method: "PATCH",
      url: `/todos/${todoObject.id}`,
      payload: todoObject,
    });

    expect(response.statusCode).to.equal(200);
    expect(response.result).to.deep.equal(todoObject);
  });
});
