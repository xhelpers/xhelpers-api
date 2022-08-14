import * as Hapi from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import * as Joi from "joi";

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
) => Promise<Hapi.ResponseObject | Boom.Boom>;

export interface IRouteAdd {
  validate(validate: IValidateParams): IRouteAdd;
  handler(action: HandlerActionParams): IRouteBuild;
}
