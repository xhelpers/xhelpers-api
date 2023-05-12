import { expect } from "chai";
import { Server } from "@hapi/hapi";
import { createServer } from "../server";
import { BaseRouteSimple } from "../route";

const zlib = require("zlib");
const { promisify } = require("util");

const gzip = promisify(zlib.gzip);
const deflate = promisify(zlib.deflate);

class Routes extends BaseRouteSimple {
  constructor() {
    super(["compression"]);
    this.route("POST", "/gzip", {}, false)
      .handler(async (r, h, u) => {
        expect(r.payload).to.deep.equal({ key: "value" });
        return h.response(r.payload).code(200);
      })
      .build();

    this.route("POST", "/deflate", {}, false)
      .handler(async (r, h, u) => {
        expect(r.payload).to.deep.equal({ key: "value" });
        return h.response(r.payload).code(200);
      })
      .build();
  }
}

describe("🚧  Testing Server compression", () => {
  let server: Server;

  beforeEach(async () => {
    const options: any = {
      serverOptions: {
        port: 3000,
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

  it("should compress and decompress payload using gzip", async () => {
    const compressed = await gzip(JSON.stringify({ key: "value" }));

    const response = await server.inject({
      method: "POST",
      url: "/gzip",
      headers: {
        "Content-Type": "application/json",
        "Content-Encoding": "gzip",
        "Accept-Encoding": "gzip",
      },
      payload: compressed, // send buffer
    });

    expect(response.statusCode).to.equal(200);
    expect(response.result).to.deep.equal({ key: "value" });
  });

  it("should compress and decompress payload using deflate", async () => {
    const buffer = Buffer.from(JSON.stringify({ key: "value" }), "utf8");
    var deflated = await deflate(buffer);
    const response = await server.inject({
      method: "POST",
      url: "/deflate",
      headers: {
        "Content-Type": "application/json",
        "Content-Encoding": "deflate",
        "Accept-Encoding": "deflate",
      },
      payload: deflated, // send buffer
    });
    expect(response.statusCode).to.equal(200);
    expect(response.result).to.deep.equal({ key: "value" });
  });
});
