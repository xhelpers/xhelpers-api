import * as Joi from "joi";

import { IBaseService } from "./contracts/IBaseService";
import { IRouteAdd } from "./contracts/IRouteAdd";
import { IRouteBuild } from "./contracts/IRouteBuild";
import safeCall from "./safe-call";

export default abstract class BaseRoute<T extends IBaseService>
  implements IRouteAdd, IRouteBuild {
  service: T;
  tags: any;
  constructor(service: T, tags: any = ["."]) {
    this.service = service;
    this.routes = [];
    this.tags = tags;
  }
  routes: Array<any>;
  curentRoute!: {
    method: string;
    path: string;
    handler?: Function;
    options: {
      tags: any;
      validate: {
        payload: any;
        headers?: any;
        query?: any;
        params?: Joi.ObjectSchema;
      };
      auth: any;
      payload?: {
        maxBytes: number;
        parse: boolean;
        output: string;
      };
    };
  };

  protected defaultAuthHeader = Joi.object({
    authorization: Joi.string().required()
  }).options({ allowUnknown: true });

  protected defaultSearchQuery = Joi.object({
    page: Joi.number().default(1),
    limit: Joi.number().default(10)
    // sort: Joi.string()
    //   .default()
    //   .allow("", null)
    //   .description(
    //     'MUST be a valid JSON / sort sintax, ex: asc: { "_id": 0 } | desc: { "_id": -1 }'
    //   ),
    // filter: Joi.string()
    //   .allow("", null)
    //   .description(
    //     'MUST be a valid JSON / find sintax, ex: { "description": { "$regex": "FiNd-mE", $options: "i" } }'
    //   ),
    // fields: Joi.array()
    //   .items(Joi.string())
    //   .allow("", null)
    //   .description("Array of field path, ex: name description")
  });

  protected defaultIdProperty = Joi.object({
    id: Joi.any()
      .required()
      .description("id of the entity")
  });

  route(
    method: any,
    path: any,
    options?: {
      tags?: any;
      validate?: {
        payload: any;
        headers?: any;
        query?: any;
        params?: Joi.ObjectSchema | undefined;
      };
      auth?: any;
      payload?: { maxBytes: number; parse: boolean; output: string };
      plugins?: any;
    },
    requireAuth: boolean = true
  ): IRouteAdd {
    this.curentRoute = {
      method,
      path,
      options: {
        tags: ["api", ...this.tags],
        validate: {
          payload: null,
          // headers: requireAuth ? this.defaultAuthHeader : null
          headers: null
        },
        // auth: requireAuth ? "jwt" : false,
        auth: false,
        ...options
      }
    };
    return this;
  }
  validate(validate: {
    payload?: any;
    headers?: any;
    query?: any;
    params?: any;
  }): IRouteAdd {
    Object.assign(this.curentRoute.options.validate, validate);
    return this;
  }
  handler(action: (r: any, h: any, user?: any) => Promise<any>): IRouteBuild {
    this.curentRoute.handler = async function(request: any, h: any) {
      return safeCall(request, async (user: any) => {
        return await action(request, h, user);
      });
    };
    return this;
  }
  build() {
    this.routes.push(this.curentRoute);
  }
  public buildRoutes() {
    return this.routes;
  }
}
