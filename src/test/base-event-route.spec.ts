import { expect } from "chai";
import { BaseEventRoute } from "../route";
const sinon = require("sinon");

class TestEvent extends BaseEventRoute {
  constructor(tags: any[]) {
    super(tags);
  }
  getTags() {
    return this.tags;
  }
  setOptions: any = (options: any) => {
    this.curentRoute = options;
  };

  getOptions() {
    return this.curentRoute;
  }
}

describe("🚧  Testing Server route service BaseEventRoute", () => {
  it("constructor should initialize with correct tags", () => {
    const testEvent = new TestEvent(["tags"]);
    expect(testEvent.getTags()).to.eql(["tags"]);
  });

  it("should create correctly an EventFluxBuilder", () => {
    const testEvent = new TestEvent(["tags"]);
    const stubAction = sinon.stub();

    testEvent.setOptions({
      options: {
        event: {
          queue: "queue",
          exchange: "exchange",
          exchange_type: "exchange_type",
        },
      },
      method: "get",
      path: "/api/tests",
    });

    testEvent.handler(stubAction);
    const pathIdKey = "get.api.tests";
    expect(testEvent.builders).to.have.property(pathIdKey);
  });

  it("should construct all flux", () => {
    const testEvent = new TestEvent(["tags"]);
    testEvent.builders = {
      key1: {
        construct: sinon.stub().returns("flux1"),
      } as any,
      key2: {
        construct: sinon.stub().returns("flux2"),
      } as any,
    };
    testEvent.buildRoutes();
    expect(testEvent.flows).to.eql({
      key1: "flux1",
      key2: "flux2",
    });
  });

  it("should set correct handler for current route", async function () {
    const testEvent = new TestEvent(["tags"]);

    const eventMock = {
      params: "params",
      query: "query",
      payload: "payload",
    };

    testEvent.setOptions({
      options: {
        event: eventMock,
      },
      method: "post",
      path: "/api/tests",
    });

    const eventFluxMock = {
      addEvent: sinon.spy(),
      closeAll: sinon.spy(),
      closeChannel: sinon.spy(),
    };
    const codeAction = {
      code: sinon.spy(),
    };
    const hMock = {
      response: () => codeAction,
    };
    testEvent.flows["post.api.tests"] = eventFluxMock;
    const stubAction = sinon.stub();
    testEvent.handler(stubAction);

    const opts = testEvent.getOptions();
    let result = null;
    if (opts.handler) {
      result = await opts.handler(eventMock, hMock);
    }
    // Validates that the `addEvent` function has been called with the correct parameter.
    sinon.assert.calledWith(eventFluxMock.addEvent, {
      params: eventMock.params,
      query: eventMock.query,
      payload: eventMock.payload,
      user: undefined,
    });

    sinon.assert.calledWith(codeAction.code, 200);
  });
});
