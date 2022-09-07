import * as amqplib from "amqplib";

export default abstract class RabbitOperator {
  defaultExchange = "";

  defaultQueue = "";

  amqpUrl: string = "";

  amqpConn: any;

  pubChannel: any;

  prefetch: number = 1;

  offlinePubQueue: any[] = [];

  whenConnectedList: any[] = [];

  constructor() {
    if (!process.env.RABBITMQ_URL) {
      console.log(
        "Rabbit env not set - RABBITMQ_URL",
        process.env.RABBITMQ_URL
      );
      return;
    }
    this.amqpUrl = process.env.RABBITMQ_URL;
    this.prefetch = Number(process.env.RABBITMQ_PREFETCH_SUB || 1);
  }

  private restartServer(): Promise<any> {
    return new Promise(() =>
      setTimeout(() => {
        this.start();
      }, 5000)
    );
  }

  private closeOnErr(err: any) {
    if (!err) return false;
    console.error("[AMQP] error", err);
    if (this.amqpConn) this.amqpConn.close();
    return true;
  }

  abstract handleNewEvent(evt: any): Promise<any>;

  public publish(payload: any, exchange: string = "", channel: string = "") {
    try {
      console.log("Pub event on queue:", channel || this.defaultQueue);

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
    } catch (e: any) {
      console.error("[AMQP] publish", e.message);
      this.offlinePubQueue.push([exchange, channel, payload]);
    }
  }

  public isConnected() {
    return this.amqpConn && !!this.amqpConn;
  }

  isRestarting = false;

  protected async start(handlerConnected?: any) {
    if (!this.amqpUrl) return;

    try {
      const conn = await amqplib.connect(this.amqpUrl, "heartbeat=900");
      if (!conn) {
        console.error("[AMQP] err");
        return this.restartServer();
      }
      conn.on("error", (err) => {
        console.error("[AMQP] conn error", err.message);
        this.closeOnErr(err);
      });
      conn.on("close", (ee) => {
        console.error("[AMQP] reconnecting");
        if (!this.isRestarting) {
          this.isRestarting = true;
          return this.restartServer();
        }
      });
      this.amqpConn = conn;
      console.log("[AMQP] connected");
      this.isRestarting = false;
      if (handlerConnected) handlerConnected();
      else {
        for (const whenHandler of this.whenConnectedList) {
          await this.whenConnected(whenHandler.queue, whenHandler.handler);
        }
      }
    } catch (error: any) {
      console.log("[AMQP] failed connection", error.message);
      return this.restartServer();
    }
  }

  public async whenConnected(queue?: string, handler?: any) {
    if (this.whenConnectedList.every((s) => s.queue !== queue)) {
      this.whenConnectedList.push({ queue, handler });
    }
    this.startPublisher(queue);
    this.startWorker(queue, handler);
    console.log("Connected pub/sub for:", queue);
  }

  private async startPublisher(queue?: string) {
    if (!this.amqpConn) throw new Error("Invalid connection");
    const ch = await this.amqpConn.createConfirmChannel(
      this.defaultExchange,
      queue || this.defaultQueue
    );
    if (!ch) throw new Error("Invalid channel");

    ch.on("error", (err: any) => {
      console.error("[AMQP] channel error", err.message);
    });
    ch.on("close", () => {
      console.log("[AMQP] channel closed");
    });

    this.pubChannel = ch;
    while (this.offlinePubQueue.length > 0) {
      const [exchange, routingKey, content] = this.offlinePubQueue.shift();
      this.publish(
        content,
        exchange || this.defaultExchange,
        routingKey || this.defaultQueue
      );
    }
  }

  protected async startWorker(queue?: string, handler?: any) {
    if (!this.amqpConn) throw new Error("Invalid connection");
    const ch = await this.amqpConn.createChannel();
    if (!ch) throw new Error("Invalid channel");

    ch.on("error", (err: any) => {
      console.error("[AMQP] channel error", err.message);
    });
    ch.on("close", () => {
      console.log("[AMQP] channel closed");
    });

    ch.prefetch(this.prefetch);
    await ch.assertQueue(queue || this.defaultQueue);
    await ch.consume(
      queue || this.defaultQueue,
      async (msg: any) => {
        try {
          const jsonPayload = JSON.parse(msg.content.toString());
          const { id } = jsonPayload;
          console.log(
            `New event on queue '${msg.fields.routingKey}' - id:'${id}'`
          );
          const ok = handler
            ? await handler(jsonPayload)
            : await this.handleNewEvent(jsonPayload);
          if (ok) {
            ch.ack(msg);
            console.log(
              `Ack event on queue '${msg.fields.routingKey}' - id:'${id}'`
            );
          } else {
            ch.reject(msg, true);
            console.log(
              `Reject event on queue '${msg.fields.routingKey}' - id:'${id}'`
            );
          }
        } catch (e) {
          console.log(`Reject err event on queue '${msg.fields.routingKey}'`);
          ch.reject(msg, true);
        }
      },
      {
        noAck: false,
      }
    );
  }
}
