import * as Hapi from "@hapi/hapi";
import * as Joi from "@hapi/joi";

import { IRouteBuild } from "./IRouteBuild";

export interface IValidateParams {
  payload?: Joi.ObjectSchema<any>;
  headers?: Joi.ObjectSchema<any>;
  query?: Joi.ObjectSchema<any>;
  params?: Joi.ObjectSchema<any>;
}

export type HandlerActionParams = (
  r: Hapi.Request,
  h: Hapi.ResponseToolkit,
  user: any
) => Promise<Hapi.ResponseObject>;

export interface IRouteAdd {
  validate(validate: IValidateParams): IRouteAdd;
  handler(action: HandlerActionParams): IRouteBuild;
}
