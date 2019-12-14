import * as Joi from "joi";

import { IRouteBuild } from "./IRouteBuild";

export interface IRouteAdd {
  validate(validate: {
    payload?: Joi.ObjectSchema;
    headers?: Joi.ObjectSchema;
    query?: Joi.ObjectSchema;
    params?: Joi.ObjectSchema;
  }): IRouteAdd;
  handler(action: (r: any, h: any, user: any) => Promise<any>): IRouteBuild;
}
