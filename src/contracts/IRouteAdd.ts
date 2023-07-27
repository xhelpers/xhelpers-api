import * as Hapi from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import * as Joi from "joi";

import { IRouteBuild } from "./IRouteBuild";
import { IEventFlux } from "../service";

export interface IValidateParams {
  payload?: Joi.ObjectSchema<any>;
  headers?: Joi.ObjectSchema<any>;
  query?: Joi.ObjectSchema<any>;
  params?: Joi.ObjectSchema<any>;
}

export interface HandlerActionParams {
  (r: Hapi.Request, h: Hapi.ResponseToolkit, user: any): Promise<
    Hapi.ResponseObject | Boom.Boom
  >;
}

export interface HandlerEventActionParams {
  (
    flow: IEventFlux,
    event: {
      payload?: any;
      query?: any;
      params?: any;
    }
  ): Promise<[boolean, any]>;
}

export interface IRouteAdd<T = HandlerActionParams> {
  validate(validate: IValidateParams): IRouteAdd<T>;
  handler(action: T): IRouteBuild;
}
