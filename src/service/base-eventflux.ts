import RabbitOperator from "./base-events-rabbitmq";

interface DefaultEvent {
  id?: string;
  [key: string]: any;
}

interface DefaultQueuePayload {
  event: DefaultEvent;
}

interface IAddEvent {
  event: DefaultEvent;
  queue?: string;
  exchange?: string;
}

interface DefaultServicePayload<T> extends DefaultQueuePayload {
  service: T | null;
}

type EventHandler<T = void> = (
  event: T extends void ? DefaultQueuePayload : DefaultServicePayload<T>
) => Promise<[boolean, any]>;

type QueueHandler = (event: DefaultEvent) => Promise<boolean>;

type WhenEventOccursType<T = void> = Pick<
  IEventFluxBuilder<T>,
  | "thenContinueWith"
  | "thenPublishTo"
  | "whenOperationCompletes"
  | "whenOperationFails"
  | "construct"
>;

type ThenContinueWithType<T = void> = Pick<
  IEventFluxBuilder<T>,
  | "thenContinueWith"
  | "thenPublishTo"
  | "whenOperationCompletes"
  | "whenOperationFails"
  | "construct"
>;

type ThenPublishToType<T = void> = Pick<
  IEventFluxBuilder<T>,
  | "thenContinueWith"
  | "thenPublishTo"
  | "whenOperationCompletes"
  | "whenOperationFails"
  | "construct"
>;

type WhenOperationCompletesType<T = void> = Pick<
  IEventFluxBuilder<T>,
  "thenContinueWith" | "thenPublishTo" | "whenOperationFails" | "construct"
>;

type WhenOperationFailsType<T = void> = Pick<
  IEventFluxBuilder<T>,
  "thenContinueWith" | "thenPublishTo" | "construct"
>;

interface IEventFluxCollection {
  whenOperationCompletes: IEventFlux[];
  whenOperationFails: IEventFlux[];
  whenEventOccurs: IEventFlux[];
}

interface IEventFluxPublish {
  whenOperationCompletes: Array<
    (event: DefaultEvent, operation: IOperatorDefault) => void
  >;
  whenOperationFails: Array<
    (event: DefaultEvent, operation: IOperatorDefault) => void
  >;
  whenEventOccurs: Array<
    (event: DefaultEvent, operation: IOperatorDefault) => void
  >;
}

export interface IEventFluxBuilder<T = void> {
  whenEventOccurs(handler: EventHandler<T>): WhenEventOccursType<T>;
  whenOperationCompletes(
    handler: EventHandler<T>
  ): WhenOperationCompletesType<T>;
  whenOperationFails(handler: EventHandler<T>): WhenOperationFailsType<T>;
  thenContinueWith(flow: IEventFlux): ThenContinueWithType<T>;
  thenPublishTo(add: IAddEvent): ThenPublishToType<T>;
  construct(): IEventFlux;
}

export interface IEventFlux {
  addEvent(event: DefaultEvent, queue?: string, exchange?: string): void;
  closeChannel(channel: string): void;
  closeAll(): void;
}

export interface IOperatorDefault {
  publishEvent(payload: DefaultEvent, queue?: string, exchange?: string): void;
  closeChannel(channel: string): void;
  closeAll(): void;
}

export abstract class EventServiceFactory<T> {
  abstract resolve({ event }: DefaultEvent): T;
}

interface IEventFluxHandlers<T = void> {
  whenEventOccurs: EventHandler<T>;
  whenOperationCompletes: EventHandler<T> | null;
  whenOperationFails: EventHandler<T> | null;
}

interface EventOptions<T = void> {
  queue: string;
  exchange?: string;
  exchange_type?: string;
  prefetch?: number;
  factory?: EventServiceFactory<T>;
}

export class EventFluxBuilder<T = void> implements IEventFluxBuilder<T> {
  constructor(
    opts: EventOptions<T> = {
      queue: "",
    }
  ) {
    this.opts = opts;
    if (opts.factory) this.factory = opts.factory;
  }

  operator!: IOperatorDefault;

  private factory: EventServiceFactory<T> | null = null;
  private opts: EventOptions<T>;
  protected handlers: IEventFluxHandlers<T> = {
    whenEventOccurs: async ({ event }) => [true, event],
    whenOperationCompletes: null,
    whenOperationFails: null,
  };

  protected flows: IEventFluxCollection = {
    whenOperationCompletes: [],
    whenOperationFails: [],
    whenEventOccurs: [],
  };
  protected pubs: IEventFluxPublish = {
    whenOperationCompletes: [],
    whenOperationFails: [],
    whenEventOccurs: [],
  };

  private events_keys = {
    whenEventOccurs: "whenEventOccurs",
    whenOperationCompletes: "whenOperationCompletes",
    whenOperationFails: "whenOperationFails",
  };
  protected continueContext: string = this.events_keys.whenEventOccurs;

  protected callNextFlows(event: DefaultEvent, type: string) {
    this.flows[type as keyof IEventFluxCollection].forEach(
      (flow: IEventFlux) => {
        try {
          flow.addEvent(event);
        } catch (error) {
          console.error(error);
        }
      }
    );

    this.pubs[type as keyof IEventFluxPublish].forEach((fnPublish) => {
      try {
        fnPublish(event, this.operator);
      } catch (error) {
        console.error(error);
      }
    });
  }

  whenEventOccurs(handler: EventHandler<T>): WhenEventOccursType<T> {
    this.handlers.whenEventOccurs = (event) => this.retry(() => handler(event));
    this.continueContext = this.events_keys.whenEventOccurs;
    return this;
  }

  whenOperationCompletes(
    handler: EventHandler<T>
  ): WhenOperationCompletesType<T> {
    this.handlers.whenOperationCompletes = (event) =>
      this.retry(() => handler(event));
    this.continueContext = this.events_keys.whenOperationCompletes;
    return this;
  }

  whenOperationFails(handler: EventHandler<T>): WhenOperationFailsType<T> {
    this.handlers.whenOperationFails = (event) =>
      this.retry(() => handler(event));
    this.continueContext = this.events_keys.whenOperationFails;
    return this;
  }

  thenContinueWith(flow: EventFlux): ThenContinueWithType<T> {
    this.flows[this.continueContext as keyof IEventFluxCollection].push(flow);
    return this;
  }

  thenPublishTo(add: IAddEvent): ThenPublishToType<T> {
    const fnPublish =
      (add: IAddEvent) => (event: DefaultEvent, operator: IOperatorDefault) => {
        operator.publishEvent(
          { ...event, ...(add.event || {}) },
          add.queue,
          add.exchange
        );
      };
    this.pubs[this.continueContext as keyof IEventFluxPublish].push(
      fnPublish(add)
    );
    return this;
  }

  construct(): IEventFlux {
    const handler =
      (type: string, rethrow: boolean = false) =>
      async (event: DefaultEvent) => {
        let ack = true;
        try {
          if (this.handlers[type as keyof IEventFluxHandlers]) {
            let service!: T;
            if (this.factory) service = this.factory.resolve({ event });

            const fnHandler = this.handlers[type as keyof IEventFluxHandlers];
            if (fnHandler) {
              const params: any = {
                service,
                event,
                type,
              };
              const [result, data] = await fnHandler(params);
              ack = result;
              if (ack && data) event = data;
            }
          }
        } catch (e: any) {
          if (rethrow) throw e;
          console.error(
            `[EventFlux-err] Event '${type}' id:'${event.id}' message: '${e.message}'`
          );
          if (process.env.LOG_LEVEL === "UHIGH") {
            console.error("Stacktrace: ", e);
          }
        }
        if (ack) this.callNextFlows(event, type);
        return ack;
      };
    this.operator = new OperatorDefault({
      queue: this.opts.queue,
      exchange: this.opts.exchange,
      prefetch: this.opts.prefetch,
      exchange_type: this.opts.exchange_type,
      handlers: {
        onEvent: handler(this.events_keys.whenEventOccurs, true),
        onComplete: this.handlers[
          this.events_keys.whenOperationCompletes as keyof IEventFluxHandlers
        ]
          ? handler(this.events_keys.whenOperationCompletes)
          : null,
        onFail: this.handlers[
          this.events_keys.whenOperationFails as keyof IEventFluxHandlers
        ]
          ? handler(this.events_keys.whenOperationFails)
          : null,
      },
    });

    return new EventFlux(this.operator);
  }

  protected retry<T>(
    fn: () => Promise<T>,
    retries: number = 2,
    delay: number = 5000
  ): Promise<T> {
    const delayed = (ms: number) => {
      return new Promise((res) => setTimeout(res, ms));
    };
    let attempts = 0;
    const retryAttempt = async (): Promise<T> => {
      if (attempts > 0)
        console.log(
          `[EventFlux-failed] Trying again in: ${delay}ms - attempts: ${attempts}/${retries}`
        );

      try {
        return await fn();
      } catch (error) {
        if (attempts++ >= retries) {
          throw error;
        } else {
          return delayed(delay).then(retryAttempt);
        }
      }
    };
    return retryAttempt();
  }
}

export class EventFlux implements IEventFlux {
  private operator: IOperatorDefault;
  constructor(operator: IOperatorDefault) {
    this.operator = operator;
  }

  addEvent(event: DefaultEvent, queue?: string, exchange?: string): void {
    this.operator.publishEvent(event, queue, exchange);
  }

  closeChannel(channel: string): void {
    this.operator.closeChannel(channel);
  }

  closeAll(): void {
    this.operator.closeAll();
  }
}

interface IOperatorOpetions {
  queue: string;
  exchange?: string;
  exchange_type?: string;
  prefetch?: number;
  queueCompleted?: string;
  queueFailed?: string;
  handlers: {
    onEvent: QueueHandler;
    onComplete: QueueHandler | null;
    onFail: QueueHandler | null;
  };
}

export class OperatorDefault
  extends RabbitOperator
  implements IOperatorDefault
{
  constructor(opts: IOperatorOpetions) {
    super();
    this.setDefaults(opts);

    this.start(() => {
      // set queue prefetch count
      if (this.options.prefetch) this.prefetch = this.options.prefetch;

      this.whenConnected(
        this.options.queue,
        null,
        this.prefetch,
        this.options.exchange,
        this.options.exchange_type
      );
      if (this.options.handlers.onComplete)
        this.whenConnected(
          this.options.queueCompleted,
          this.options.handlers.onComplete,
          this.prefetch,
          this.options.exchange,
          this.options.exchange_type
        );
      if (this.options.handlers.onFail)
        this.whenConnected(
          this.options.queueFailed,
          this.options.handlers.onFail,
          this.prefetch,
          this.options.exchange,
          this.options.exchange_type
        );
    });
  }

  public async whenConnected(
    queue?: string,
    handler?: any,
    prefetch?: number,
    exchange: string = "",
    exchange_type: string = ""
  ) {
    consumersRoutes.push({ queue, exchange, type: exchange_type });
    super.whenConnected(queue, handler, prefetch, exchange, exchange_type);
  }

  private options: IOperatorOpetions = {
    queue: "",
    queueCompleted: "",
    queueFailed: "",
    handlers: {
      onEvent: async () => true,
      onComplete: null,
      onFail: null,
    },
  };

  private setDefaults(opts: IOperatorOpetions) {
    if (!opts.queue) opts.queue = "unnamed";
    const queuename = opts.queue.split(":").shift();
    this.options = {
      ...this.options,
      queue: opts.queue,
      exchange: opts.exchange || "",
      exchange_type: opts.exchange_type || "topic",
      prefetch: opts.prefetch || 1,
      queueCompleted: `${queuename}.done`,
      queueFailed: `${queuename}.fail`,
      handlers: opts.handlers,
    };
  }

  async publishEvent(payload: DefaultEvent, queue?: string, exchange?: string) {
    return this.publish(
      payload,
      exchange || this.options.exchange,
      queue || this.options.queue
    );
  }

  async handleNewEvent(event: DefaultEvent): Promise<any> {
    try {
      const ack = await this.options.handlers.onEvent(event);
      if (ack && this.options.handlers.onComplete)
        this.publish(event, this.options.exchange, this.options.queueCompleted);
      return ack;
    } catch (error) {
      if (this.options.handlers.onFail)
        this.publish(event, this.options.exchange, this.options.queueFailed);
      return true;
    }
  }
}

const consumersRoutes: any = [];
export const displayRoutes = () => {
  console.log("=".repeat(100));
  console.log("Consumers events table:");
  const icons: any = {
    topic: "📌 ",
    direct: "📫 ",
    fanout: "📢 ",
  };
  consumersRoutes
    .sort((a: any, b: any) => a.exchange.localeCompare(b.exchange))
    .forEach((ch: any) => {
      const iconRoute = icons[ch.type] || "🚧";
      console.log(`\t${iconRoute} ${ch.type} \t${ch.exchange} \t${ch.queue}`);
    });
  console.log("=".repeat(100));
};
