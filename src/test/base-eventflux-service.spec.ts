const { expect } = require("chai");
import { EventFluxBuilder, EventFlux } from "../service/base-eventflux";
const sinon = require("sinon");

class TestBuilder extends EventFluxBuilder {
  getHandlers = () => this.handlers;
  getFlows = () => this.flows;
  setFlows = (flows: any) => (this.flows = flows);
  getPubs = () => this.pubs;
  setPubs = (pubs: any) => (this.pubs = pubs);
  getContext = () => this.continueContext;

  checkRetry = this.retry;
  checkCallNextFlows = this.callNextFlows;
}

describe("🚧 Testing service EventFluxBuilder", () => {
  let builder!: TestBuilder;

  beforeEach(() => {
    builder = new TestBuilder();
  });

  it("whenEventOccurs sets handler and continueContext", () => {
    const handler = async (): Promise<[boolean, any]> => {
      return [true, {}];
    };
    builder.whenEventOccurs(handler);
    expect(builder.getHandlers().whenEventOccurs).to.exist;
    expect(builder.getContext()).to.equal("whenEventOccurs");
  });
  it("whenOperationCompletes sets handler and continueContext", () => {
    const handler = async (): Promise<[boolean, any]> => {
      return [true, {}];
    };
    builder.whenEventOccurs(handler).whenOperationCompletes(handler);
    expect(builder.getHandlers().whenOperationCompletes).to.exist;
    expect(builder.getContext()).to.equal("whenOperationCompletes");
  });
  it("whenOperationFails sets handler and continueContext", () => {
    const handler = async (): Promise<[boolean, any]> => {
      return [true, {}];
    };
    builder
      .whenEventOccurs(handler)
      .whenOperationCompletes(handler)
      .whenOperationFails(handler);
    expect(builder.getHandlers().whenOperationFails).to.exist;
    expect(builder.getContext()).to.equal("whenOperationFails");
  });

  it("thenContinueWith push flow to list of handlers", () => {
    const handler = async (): Promise<[boolean, any]> => {
      return [true, {}];
    };
    builder
      .whenEventOccurs(handler)
      .thenContinueWith(new TestBuilder().construct());
    expect(builder.getHandlers().whenEventOccurs).to.exist;
    expect(builder.getContext()).to.equal("whenEventOccurs");
    expect(builder.getFlows().whenEventOccurs).to.exist;
    expect(builder.getFlows().whenEventOccurs.length).to.equal(1);
  });

  it("thenPublishTo push pubs to list of handlers", () => {
    const handler = async (): Promise<[boolean, any]> => {
      return [true, {}];
    };
    builder
      .whenEventOccurs(handler)
      .thenContinueWith(new TestBuilder().construct())
      .thenPublishTo({
        event: { custom: "data" },
        queue: "tests",
        exchange: "users",
      });
    expect(builder.getHandlers().whenEventOccurs).to.exist;
    expect(builder.getContext()).to.equal("whenEventOccurs");
    expect(builder.getPubs().whenEventOccurs).to.exist;
    expect(builder.getPubs().whenEventOccurs.length).to.equal(1);
  });

  it("construct returns an instance of IEventFlux", () => {
    const flux = builder.construct();
    expect(flux).to.exist;
    expect(flux.addEvent).to.exist;
  });

  describe("retry", () => {
    it("should retry the function call given the number of retries and delay", async () => {
      const fun = sinon.stub();
      fun.onCall(0).throws(new Error("error"));
      fun.onCall(1).returns("success");
      const result = await builder.checkRetry(fun, 2, 10);
      expect(result).equals("success");
      expect(fun.callCount).equals(2);
    });
  });

  describe("callNextFlows", () => {
    it("should call all flows and publishes", () => {
      const event = { id: "1", api: "test" };
      const type = "whenOperationCompletes";
      const flow = { addEvent: sinon.stub() };
      const pub = sinon.stub();

      builder.setFlows({ [type]: [flow] });
      builder.setPubs({ [type]: [pub] });

      builder.checkCallNextFlows(event, type);

      expect(flow.addEvent.calledOnceWith(event)).equals(true);
      expect(pub.calledOnceWith(event, builder.operator)).equals(true);
    });
  });
});

describe("🚧 Testing service EventFlux", () => {
  let operator = {
    publishEvent: (event: any, queue: string, exchange: string) => {},
  };
  let flux = new EventFlux(operator);

  it("addEvent calls operator.publishEvent", (done) => {
    operator.publishEvent = (event, queue, exchange) => {
      expect(event).to.exist;
      done();
    };
    flux.addEvent({});
  });
});
