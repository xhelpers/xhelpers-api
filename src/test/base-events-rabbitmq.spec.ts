import { expect } from "chai";

import BaseRabbitOperator from "../service/base-events-rabbitmq";
import { amqplib } from "../tools";
import { stub } from "sinon";

const sinon = require("sinon");

class RabbitOperator extends BaseRabbitOperator {
  handleNewEvent(evt: any): Promise<any> {
    throw new Error("Method not implemented.");
  }
  constructor() {
    super();
  }
  startcon() {
    return this.start();
  }
}

describe("🚧  Testing Server route service RabbitOperator", function () {
  describe("constructor", function () {
    it("should correctly initiallize the properties", function () {
      const rabbitOperator = new RabbitOperator();
      expect(rabbitOperator.defaultQueue).to.equal("");
      expect(rabbitOperator.prefetch).to.equal(1);
    });
  });

  describe("start", function () {
    // Mocking the function calls inside the start function
    before(function () {
      sinon.stub(amqplib, "connect").returns(
        Promise.resolve({
          on: stub(),
        })
      );
      sinon
        .stub(RabbitOperator.prototype, "handleNewEvent")
        .returns(Promise.resolve({}));
    });

    after(function () {
      sinon.restore();
    });

    it("start function test", function (done) {
      const rabbitOperator = new RabbitOperator();
      rabbitOperator
        .startcon()
        .then((res) => {
          done();
        })
        .catch((e) => done(e));
    });
  });

  describe("startWorker", function () {
    it("should correctly connect the worker to a queue", async function () {
      const rabbitOperator = new RabbitOperator();
      const createChannel = sinon.stub().resolves({
        on: stub(),
        assertQueue: stub().resolves(null),
        consume: stub().resolves(null),
        ack: stub(),
        reject: stub(),
        prefetch: stub(),
      });

      rabbitOperator.amqpConn = {
        createChannel: createChannel,
      };

      await rabbitOperator.startWorker("queue_1");

      expect(createChannel.called).to.be.true;
      expect(rabbitOperator.workChannel["queue_1"]).to.exist;
    });
  });

  describe("publish", function () {
    it("should correctly publish messages", function () {
      const rabbitOperator = new RabbitOperator();
      rabbitOperator.defaultQueue = "tests.queue";
      const payload = {}; // your payload
      // mock the functions used in publish to avoid actual publish
      const channel = {
        publish: sinon.stub().yields(),
        connection: { close: sinon.stub().returns(null) },
      };
      rabbitOperator.pubChannel[rabbitOperator.defaultQueue] = channel;
      rabbitOperator.publish(payload);

      expect(channel.publish.called).to.be.true;
      expect(rabbitOperator.offlinePubQueue.length).to.equal(0);
    });
    it("should correctly connect to the publisher", async function () {
      const rabbitOperator = new RabbitOperator();
      const createConfirmChannel = sinon.stub().resolves({
        on: stub(),
        assertExchange: stub().resolves(),
        bindQueue: stub(),
        publish: stub(),
        consume: stub().resolves(),
        ack: stub(),
        reject: stub(),
        prefetch: stub(),
        assertQueue: stub(),
      });
      // mock the amqpConn object
      rabbitOperator.amqpConn = {
        createConfirmChannel: createConfirmChannel,
      };

      await rabbitOperator.startPublisher("queue_1");

      expect(createConfirmChannel.called).to.be.true;
      expect(rabbitOperator.pubChannel["queue_1"]).to.exist;
    });

    it("should call publish if the channel is created", function () {
      const rabbitOperator = new RabbitOperator();
      const channel = {
        publish: sinon.stub().yields(),
        connection: { close: sinon.stub().returns(null) },
      };

      // assuming the worker queue is already created
      const exchange = "exchange_1";
      const routingKey = "key_1";
      const data = {
        field1: "field1",
      };
      rabbitOperator.pubChannel = {};
      rabbitOperator.pubChannel[routingKey] = channel;
      rabbitOperator.pubChannel[rabbitOperator.defaultQueue] = channel;
      rabbitOperator.publish(data, exchange, routingKey, 0);

      sinon.assert.calledWith(
        channel.publish,
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(data)),
        { persistent: true, priority: 0 }
      );
    });

    it("should add data to the offlinePubQueue if channel is not created", function () {
      const rabbitOperator = new RabbitOperator();
      rabbitOperator.pubChannel = {}; // clear channels and force offline

      const exchange = "exchange_2";
      const routingKey = "key_2";
      const data = {
        field1: "field1",
      };

      rabbitOperator.publish(data, exchange, routingKey);
      expect(rabbitOperator.offlinePubQueue.length).to.equal(1);
    });
  });

  describe("Connection", function () {
    const rabbitOperator = new RabbitOperator();

    describe("onConnect", function () {
      beforeEach(function () {
        sinon.stub(rabbitOperator, "startPublisher");
        sinon.stub(rabbitOperator, "startWorker");
      });

      it("should start a publisher and a worker when a connection is established", function () {
        // simulating passing the connection to onConnect function when the connection is established
        rabbitOperator.whenConnected("");
        expect((rabbitOperator.startPublisher as any).calledOnce).to.be.true;
        expect((rabbitOperator.startWorker as any).calledOnce).to.be.true;
      });
    });
  });
});
