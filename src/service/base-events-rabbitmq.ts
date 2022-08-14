import * as amqplib from "amqplib";

export default abstract class RabbitOperator {
  defaultExchange = "";

  defaultQueue = "";

  amqpUrl: string;

  amqpConn: any;

  pubChannel: any;

  prefetch: number = 1;

  offlinePubQueue: any[] = [];

  constructor(defaultQueue: string) {
    this.amqpUrl = process.env.RABBITMQ_URL || "";
    if (!this.amqpUrl) {
      console.log("Rabbitmq environment not set - RABBITMQ_URL");
      return;
    }
    this.prefetch = Number(process.env.RABBITMQ_PREFETCH_SUB || 1);
    this.defaultQueue = defaultQueue;
    this.start().then(() => this.whenConnected());
  }

  abstract consume(evt: any): Promise<boolean>;

  public publish(payload: any, exchange: string = "", channel: string = "") {
    try {
      this.pubChannel.publish(
        exchange || this.defaultExchange,
        channel || this.defaultQueue,
        Buffer.from(JSON.stringify(payload)),
        { persistent: true },
        (err: any) => {
          if (err) {
            console.error("[AMQP] publish", err);
            this.offlinePubQueue.push([exchange, channel, payload]);
            this.pubChannel.connection.close();
          }
        }
      );
    } catch (err: any) {
      console.error("[AMQP] publish", err.message);
      this.offlinePubQueue.push([exchange, channel, payload]);
    }
  }

  public isConnected() {
    return this.amqpConn && !!this.amqpConn;
  }

  private async start(): Promise<any> {
    if (!this.amqpUrl) return;

    const conn = await amqplib.connect(this.amqpUrl, "heartbeat=60");
    if (!conn) {
      console.error("[AMQP] connection failed");
      return setTimeout(this.start, 1000);
    }
    conn.on("error", (err: any) => {
      if (err.message !== "Connection closing") {
        console.error("[AMQP] conn error", err.message);
      }
    });
    conn.on("close", () => {
      console.error("[AMQP] reconnecting");
      return setTimeout(this.start, 1000);
    });
    this.amqpConn = conn;
    console.log("[AMQP] connected");
  }

  public async whenConnected() {
    this.startPublisher();
    this.startWorker();
  }

  private async startPublisher() {
    if (!this.amqpConn) return this.restartServer();
    const ch = await this.amqpConn
      .createConfirmChannel(this.defaultExchange, this.defaultQueue)
      .catch(this.closeOnErr);
    if (!ch) return;

    ch.on("error", (err: any) => {
      console.error("[AMQP] channel error", err.message);
    });
    ch.on("close", () => {
      console.log("[AMQP] channel closed");
    });

    this.pubChannel = ch;
    while (this.offlinePubQueue.length > 0) {
      const [exchange, routingKey, content] = this.offlinePubQueue.shift();
      this.publish(exchange, routingKey, content);
    }
  }

  private async startWorker() {
    if (!this.amqpConn) return this.restartServer();
    const ch = await this.amqpConn.createChannel().catch(this.closeOnErr);
    if (!ch) return;

    ch.on("error", (err: any) => {
      console.error("[AMQP] channel error", err.message);
    });
    ch.on("close", () => {
      console.log("[AMQP] channel closed");
    });

    ch.prefetch(this.prefetch);
    await ch.assertQueue(this.defaultQueue);
    await ch.consume(
      this.defaultQueue,
      async (msg: any) => {
        try {
          const payload = JSON.parse(msg.content.toString());
          console.log(`\n📧  New event on queue ${msg.fields.routingKey}`);
          const ok = await this.consume(payload);
          if (ok) {
            ch.ack(msg);
            console.log(`\n✅  Ack event on queue ${msg.fields.routingKey}`);
          } else {
            ch.reject(msg, true);
            console.log(`\n⭕  Reject event on queue ${msg.fields.routingKey}`);
          }
        } catch (e) {
          this.closeOnErr(e);
        }
      },
      {
        noAck: false,
      }
    );
  }

  private restartServer() {
    if (this.isConnected()) return;
    return setTimeout(this.start, 1000);
  }

  private closeOnErr(err: any) {
    if (!err) return false;
    console.error("[AMQP] error", err);
    this.amqpConn.close();
    return true;
  }
}
