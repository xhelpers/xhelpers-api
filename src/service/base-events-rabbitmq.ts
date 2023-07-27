import { amqplib } from "../tools";
import { log, logger } from "../utils";

export default abstract class RabbitOperator {
  defaultQueue = "";

  amqpUrl: string = "";

  amqpConn: any;

  pubChannel: any = {};

  workChannel: any = {};

  prefetch: number = 1;

  offlinePubQueue: any[] = [];

  handlerConnected: any;

  isRestarting = false;
  socketOptions: any;

  constructor(socketOptions: any = "heartbeat=10") {
    if (!process.env.RABBITMQ_URL) {
      log("Rabbit env not set - RABBITMQ_URL", process.env.RABBITMQ_URL);
      return;
    }
    this.socketOptions = socketOptions;
    this.amqpUrl = process.env.RABBITMQ_URL;
    this.prefetch = Number(process.env.RABBITMQ_PREFETCH_SUB || 1);
  }

  delayed = (ms: number = 1000) => {
    return new Promise((res) => setTimeout(res, ms));
  };

  private restartServer(handlerConnected?: any): Promise<any> {
    log("[AMQP] Restarting connection");
    return this.delayed(5000).then(() => this.start(handlerConnected));
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
      if (!this.pubChannel[channelId]) {
        this.logInternal("[AMQP] Invalid publisher", channelId);
        this.offlinePubQueue.push([exchange, channelId, payload]);
        this.startPublisher(channelId, exchange);
        return;
      }

      log("[AMQP] Pub event on queue:", channelId);

      this.pubChannel[channelId].publish(
        exchange,
        channelId,
        Buffer.from(JSON.stringify(payload)),
        { persistent: true, priority },
        (err: any) => {
          if (err) {
            logger("error", "[AMQP] publish external", err);
            this.offlinePubQueue.push([exchange, channelId, payload]);
            try {
              this.pubChannel[channelId].connection.close();
              this.pubChannel[channelId] = null;
              this.startPublisher(channelId, exchange);
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
      this.offlinePubQueue.push([exchange, channelId, payload]);
      try {
        this.pubChannel[channelId] = null;
        this.startPublisher(channelId, exchange);
      } catch (error) {
        logger("error", "[AMQP] channel connection failed, restarting.", error);
        this.restartServer(this.handlerConnected);
      }
    }
  }

  logInternal = (message: string, data?: any) => {
    if (process.env.LOG_LEVEL === "UHIGH") log(message, data);
  };

  protected async start(handlerConnected?: any) {
    this.logInternal("[AMQP] Rabbitmq connecting");
    if (this.isRestarting) return;
    if (handlerConnected) this.handlerConnected = handlerConnected;

    try {
      this.isRestarting = true;
      const conn: amqplib.Connection = await amqplib.connect(
        this.amqpUrl,
        this.socketOptions
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
      this.logInternal("[AMQP] connected");
      if (this.amqpConn && handlerConnected) handlerConnected();
      this.isRestarting = false;
    } catch (error: any) {
      logger("error", "[AMQP] failed connection", error);
      this.isRestarting = false;
      return this.restartServer(handlerConnected);
    }
  }

  public async whenConnected(
    queue?: string,
    handler?: any,
    prefetch?: number,
    exchange: string = "",
    exchange_type: string = ""
  ) {
    this.startPublisher(queue, exchange);
    this.startWorker(queue, handler, prefetch, exchange, exchange_type);
  }

  public async startPublisher(queue?: string, exchange: string = "") {
    this.logInternal(
      `[AMQP] Connect publisher to ${queue} exchange: ${exchange}`
    );
    if (!this.amqpConn) return;

    const channelId = queue || this.defaultQueue;
    if (!this.pubChannel[channelId]) {
      const ch = await this.amqpConn
        .createConfirmChannel(exchange, channelId)
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
          this.startPublisher(channelId, exchange);
        }, 5000);
      });

      this.pubChannel[channelId] = ch;
    }

    this.delayed().then(() => {
      this.syncOffline();
    });
  }

  private syncOffline() {
    while (this.offlinePubQueue.length > 0) {
      const [exchange, routingKey, content, priority] =
        this.offlinePubQueue.shift();
      this.publish(
        content,
        exchange,
        routingKey || this.defaultQueue,
        priority
      );
    }
  }

  public async startWorker(
    queue?: string,
    handler?: any,
    prefetch?: number,
    exchange: string = "",
    exchange_type: string = "topic"
  ) {
    this.logInternal(
      `[AMQP] Connect consumer to ${queue} exchange: ${exchange} type: ${exchange_type}`
    );

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

    if (exchange) {
      this.workChannel[channelId].assertExchange(exchange, exchange_type, {
        durable: true,
      });
      const routeKey = channelId.split(":").pop();
      this.workChannel[channelId].bindQueue(channelId, exchange, routeKey);
    }

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
            this.workChannel[channelId].ack(msg);
            log(
              `[AMQP] Ack event on queue '${msg.fields.routingKey}' - id:'${id}'`
            );
          } else {
            this.workChannel[channelId].reject(msg, true);
            log(
              `[AMQP] Reject event on queue '${msg.fields.routingKey}' - id:'${id}'`
            );
          }
        } catch (e) {
          logger("error", `[AMQP] Reject err event on queue '${channelId}'`, e);
          this.workChannel[channelId].reject(msg, true);
          if (!this.workChannel[channelId])
            this.startWorker(
              channelId,
              handler,
              prefetch,
              exchange,
              exchange_type
            );
        }
      },
      {
        noAck: false,
      }
    );
  }
}
