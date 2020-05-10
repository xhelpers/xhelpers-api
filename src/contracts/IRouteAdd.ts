import * as Hapi from "@hapi/hapi";
import * as Joi from "@hapi/joi";

import { IRouteBuild } from "./IRouteBuild";

export interface IRouteAdd {
  validate(validate: {
    payload?: Joi.ObjectSchema<any>;
    headers?: Joi.ObjectSchema<any>;
    query?: Joi.ObjectSchema<any>;
    params?: Joi.ObjectSchema<any>;
  }): IRouteAdd;
  handler(
    action: (
      r: Hapi.Request,
      h: Hapi.ResponseToolkit,
      user: any
    ) => Promise<Hapi.ResponseObject>
  ): IRouteBuild;
}
