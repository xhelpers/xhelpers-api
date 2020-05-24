import BaseRouteSimple from "./base-route-simple";
import { IBaseService } from "./contracts/IBaseService";
import { IRouteAdd } from "./contracts/IRouteAdd";
import { IRouteBuild } from "./contracts/IRouteBuild";

export default abstract class BaseRoute<T extends IBaseService>
  extends BaseRouteSimple
  implements IRouteAdd, IRouteBuild {
  protected service: T;
  constructor(service: T, tags: any = ["."]) {
    super(tags);
    this.service = service;
  }
}
