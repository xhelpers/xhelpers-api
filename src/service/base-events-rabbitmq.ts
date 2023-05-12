import { amqplib } from "../tools";
import { log, logger } from "../utils";

export default abstract class RabbitOperator {
  defaultExchange = "";

  defaultQueue = "";

  amqpUrl: string = "";

  amqpConn: any;

  pubChannel: any = {};

  workChannel: any = {};

  prefetch: number = 1;

  offlinePubQueue: any[] = [];

  handlerConnected: any;

  isRestarting = false;

  constructor() {
    if (!process.env.RABBITMQ_URL) {
      log("Rabbit env not set - RABBITMQ_URL", process.env.RABBITMQ_URL);
      return;
    }
    this.amqpUrl = process.env.RABBITMQ_URL;
    this.prefetch = Number(process.env.RABBITMQ_PREFETCH_SUB || 1);
  }

  private restartServer(handlerConnected?: any): Promise<any> {
    log("[AMQP] Restarting connection");
    return new Promise(() =>
      setTimeout(() => {
        this.start(handlerConnected);
      }, 5000)
    );
  }

  private closeOnErr(err: any) {
    if (!err) return false;
    logger("error", "[AMQP] error", err);
    if (this.amqpConn) this.amqpConn.close();
    return true;
  }

  abstract handleNewEvent(evt: any): Promise<any>;

  public publish(
    payload: any,
    exchange: string = "",
    channel: string = "",
    priority: number = 0
  ) {
    const channelId = channel || this.defaultQueue;
    try {
      log("[AMQP] Pub event on queue:", channelId);

      if (!this.pubChannel[channelId]) {
        logger("error", "[AMQP] Invalid publisher", channelId);
        return;
      }

      this.pubChannel[channelId].publish(
        exchange || this.defaultExchange,
        channel || this.defaultQueue,
        Buffer.from(JSON.stringify(payload)),
        { persistent: true, priority },
        (err: any) => {
          if (err) {
            logger("error", "[AMQP] publish external", err);
            this.offlinePubQueue.push([exchange, channel, payload]);
            try {
              this.pubChannel[channelId].connection.close();
              this.pubChannel[channelId] = null;
              this.startPublisher(channelId);
            } catch (error) {
              logger(
                "error",
                "[AMQP] channel external connection close",
                error
              );
            }
          }
        }
      );
    } catch (e: any) {
      logger("error", "[AMQP] publish", e.message);
      this.offlinePubQueue.push([exchange, channel, payload]);
      try {
        this.pubChannel[channelId] = null;
        this.startPublisher(channelId);
      } catch (error) {
        logger("error", "[AMQP] channel connection failed, restarting.", error);
        this.restartServer(this.handlerConnected);
      }
    }
  }

  protected async start(handlerConnected?: any) {
    log("[AMQP] Rabbitmq trying connection");
    if (this.isRestarting) return;
    if (handlerConnected) this.handlerConnected = handlerConnected;

    try {
      this.isRestarting = true;
      const conn: amqplib.Connection = await amqplib.connect(
        this.amqpUrl,
        "heartbeat=120"
      );
      if (!conn) {
        logger("error", "[AMQP] err", conn);
        return this.restartServer(handlerConnected);
      }
      conn.on("error", (err: any) => {
        logger("error", "[AMQP] conn error", err.message);
        this.closeOnErr(err);
        this.restartServer(this.handlerConnected);
      });
      conn.on("close", (err: any) => {
        logger("error", "[AMQP] reconnecting", err);
        return this.restartServer(handlerConnected);
      });
      this.amqpConn = conn;
      log("[AMQP] connected");
      if (this.amqpConn && handlerConnected) handlerConnected();
      this.isRestarting = false;
    } catch (error: any) {
      logger("error", "[AMQP] failed connection", error);
      this.isRestarting = false;
      return this.restartServer(handlerConnected);
    }
  }

  public async whenConnected(queue?: string, handler?: any, prefetch?: number) {
    this.startPublisher(queue);
    this.startWorker(queue, handler, prefetch);
  }

  private async startPublisher(queue?: string) {
    log(`[AMQP] Connect publisher to ${queue}`);
    if (!this.amqpConn) return;

    const channelId = queue || this.defaultQueue;
    if (!this.pubChannel[channelId]) {
      const ch = await this.amqpConn
        .createConfirmChannel(this.defaultExchange, channelId)
        .catch((err: any) => {
          logger("error", "[AMQP] channel confirm error", err.message);
        });
      if (!ch) return;

      ch.on("error", (err: any) => {
        logger("error", "[AMQP] channel error", err.message);
        this.pubChannel[channelId] = null;
      });

      ch.on("close", () => {
        log("[AMQP] channel closed");
        this.pubChannel[channelId] = null;
        setTimeout(() => {
          this.startPublisher(channelId);
        }, 5000);
      });

      this.pubChannel[channelId] = ch;
    }

    while (this.offlinePubQueue.length > 0) {
      const [exchange, routingKey, content, priority] =
        this.offlinePubQueue.shift();
      this.publish(
        content,
        exchange || this.defaultExchange,
        routingKey || this.defaultQueue,
        priority
      );
    }
  }

  protected async startWorker(
    queue?: string,
    handler?: any,
    prefetch?: number
  ) {
    log(`[AMQP] Connect consumer to ${queue}`);

    if (!this.amqpConn) return;

    const channelId = queue || this.defaultQueue;
    if (!this.workChannel[channelId]) {
      const ch = await this.amqpConn.createChannel().catch((err: any) => {
        logger("error", "[AMQP] channel create error", err.message);
      });
      if (!ch) return;

      ch.on("error", (err: any) => {
        logger("error", "[AMQP] channel error", err.message);
        this.workChannel[channelId] = null;
      });
      ch.on("close", () => {
        log("[AMQP] channel closed");
        this.workChannel[channelId] = null;
      });

      this.workChannel[channelId] = ch;
    }

    this.workChannel[channelId].prefetch(prefetch || this.prefetch);
    await this.workChannel[channelId].assertQueue(channelId, {
      arguments: { maxPriority: 3 },
    });
    await this.workChannel[channelId].consume(
      channelId,
      async (msg: any) => {
        try {
          const { content, fields } = msg || { content: {} };
          const { routingKey, redelivered } = fields;

          log(
            `[AMQP] Message event queue ${routingKey} - first time: ${!redelivered}`
          );

          const str = content?.toString() || "";
          const jsonData = JSON.parse(str || "{}");
          const { id } = jsonData;

          const ok = handler
            ? await handler(jsonData)
            : await this.handleNewEvent(jsonData);
          if (ok) {
            this.workChannel[routingKey].ack(msg);
            log(
              `[AMQP] Ack event on queue '${msg.fields.routingKey}' - id:'${id}'`
            );
          } else {
            this.workChannel[routingKey].reject(msg, true);
            log(
              `[AMQP] Reject event on queue '${msg.fields.routingKey}' - id:'${id}'`
            );
          }
        } catch (e) {
          logger("error", `[AMQP] Reject err event on queue '${channelId}'`, e);
          this.workChannel[channelId].reject(msg, true);
          if (!this.workChannel[channelId])
            this.startWorker(channelId, handler, prefetch);
        }
      },
      {
        noAck: false,
      }
    );
  }
}
