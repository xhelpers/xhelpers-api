import * as Hapi from "@hapi/hapi";
import * as Joi from "@hapi/joi";

import { IRouteAdd } from "./contracts/IRouteAdd";
import { IRouteBuild } from "./contracts/IRouteBuild";
import { currentOptions } from "./server";
import safeCall from "./safe-call";

export default abstract class BaseRouteSimple
  implements IRouteAdd, IRouteBuild {
  tags: any;
  constructor(tags: any = ["."]) {
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
        payload?: Joi.ObjectSchema<any>;
        headers?: Joi.ObjectSchema<any>;
        query?: Joi.ObjectSchema<any>;
        params?: Joi.ObjectSchema<any>;
      };
      auth: any;
      payload?: {
        maxBytes: number;
        parse: boolean;
        output: string;
      };
    };
  };

  route(
    method: string,
    path: string,
    options?: {
      description?: string;
      notes?: string;
      tags?: any;
      validate?: {
        payload?: Joi.ObjectSchema<any>;
        headers?: Joi.ObjectSchema<any>;
        query?: Joi.ObjectSchema<any>;
        params?: Joi.ObjectSchema<any>;
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
          headers: requireAuth
            ? currentOptions.appkey_enabled
              ? this.defaultAutAppKeyhHeader
              : this.defaultAuthHeader
            : undefined,
        },
        auth: requireAuth
          ? currentOptions.appkey_enabled
            ? "appkey"
            : "jwt"
          : false,
        ...options,
      },
    };
    return this;
  }

  validate(validate: {
    payload?: Joi.ObjectSchema<any>;
    headers?: Joi.ObjectSchema<any>;
    query?: Joi.ObjectSchema<any>;
    params?: Joi.ObjectSchema<any>;
  }): IRouteAdd {
    Object.assign(this.curentRoute.options.validate, validate);
    return this;
  }
  handler(
    action: (
      r: Hapi.Request,
      h: Hapi.ResponseToolkit,
      user?: any
    ) => Promise<Hapi.ResponseObject>
  ): IRouteBuild {
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

  protected defaultAuthHeader = Joi.object({
    authorization: Joi.string()
      .required()
      .description("jwt token"),
  })
    .unknown(true)
    .options({ allowUnknown: true });

  protected defaultAutAppKeyhHeader = Joi.object({
    appkey: Joi.string()
      .required()
      .description("application key"),
  })
    .unknown(true)
    .options({ allowUnknown: true });

  protected defaultSearchQuery = Joi.object({
    offset: Joi.number().default(0),
    limit: Joi.number().default(25),
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
      .description("id of the entity"),
  });
}
