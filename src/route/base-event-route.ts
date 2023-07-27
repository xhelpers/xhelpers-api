import BaseRouteSimple from "./base-route-simple";
import { HandlerEventActionParams, IRouteAdd } from "../contracts/IRouteAdd";
import { IRouteBuild } from "../contracts/IRouteBuild";
import { EventFluxBuilder, IEventFlux } from "../service";
import { safeCall } from "../utils";
import { IEventFluxBuilder } from "../service/base-eventflux";

export default abstract class BaseEventRoute
  extends BaseRouteSimple<HandlerEventActionParams>
  implements IRouteAdd<HandlerEventActionParams>, IRouteBuild
{
  flows: {
    [key: string]: IEventFlux;
  } = {};
  builders: {
    [key: string]: IEventFluxBuilder;
  } = {};
  action!: HandlerEventActionParams;

  constructor(tags: any = ["events"]) {
    super(tags);
  }

  public handler(action: HandlerEventActionParams): IRouteBuild {
    const event = this.curentRoute.options.event;
    const pathId = `${this.curentRoute.method}${this.curentRoute.path.replace(
      /\//g,
      "."
    )}`.toLowerCase();

    this.builders[pathId] = new EventFluxBuilder({
      queue: event?.queue || pathId,
      exchange: event?.exchange,
      exchange_type: event?.exchange_type,
    });
    delete this.curentRoute.options.event;

    this.builders[pathId].whenEventOccurs(async ({ event }) => {
      return await action(this.flows[pathId], event as any);
    });

    this.curentRoute.handler = async (request: any, h: any) => {
      return safeCall(request, async (user: any) => {
        this.flows[pathId].addEvent({
          params: request.params,
          query: request.query,
          payload: request.payload,
          user,
        });
        return h.response({ message: "event queued" }).code(200);
      });
    };
    return this;
  }

  public buildRoutes() {
    Object.keys(this.builders).forEach((key) => {
      const builder = this.builders[key];
      this.flows[key] = builder.construct();
    });
    return super.buildRoutes();
  }
}
