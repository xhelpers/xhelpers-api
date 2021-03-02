import * as Hapi from "@hapi/hapi";
import * as Joi from "@hapi/joi";

import {
  HandlerActionParams,
  IRouteAdd,
  IValidateParams,
} from "./contracts/IRouteAdd";

import { IRouteBuild } from "./contracts/IRouteBuild";
import { currentOptions } from "./server";
import { safeCall } from "./safe-call";

export default abstract class BaseRouteSimple
  implements IRouteAdd, IRouteBuild {
  protected tags: any;
  constructor(tags: any = ["."]) {
    this.routes = [];
    this.tags = tags;
  }
  protected routes: Array<any>;
  protected curentRoute!: {
    method: string;
    path: string;
    handler?: Function;
    options: {
      tags: any;
      validate: IValidateParams;
      auth: any;
      payload?: {
        maxBytes?: number;
        parse?: boolean;
        output?: string;
        [key: string]: any;
      };
      [key: string]: any;
    };
  };

  public route(
    method: string,
    path: string,
    options?: {
      description?: string;
      notes?: string;
      tags?: any;
      validate?: IValidateParams;
      auth?: any;
      payload?: {
        maxBytes?: number;
        parse?: boolean;
        output?: string;
        [key: string]: any;
      };
      plugins?: any;
      [key: string]: any;
    },
    requireAuth: boolean = true,
    headers?: Joi.ObjectSchema
  ): IRouteAdd {
    let _headers;
    let auth;

    if (!options?.auth) {
      auth = requireAuth
        ? currentOptions.appkey_enabled
          ? "appkey"
          : "jwt"
        : false;
    } else {
      auth = options.auth;
    }

    if (headers) {
      _headers = headers;
    } else {
      if (auth === "appkey") {
        _headers = this.defaultAutAppKeyhHeader;
      } else if (auth === "jwt") {
        _headers = this.defaultAuthHeader;
      }
    }

    this.curentRoute = {
      method,
      path,
      options: {
        tags: ["api", ...this.tags],
        validate: {
          headers: _headers,
        },
        auth,
        ...options,
      },
    };
    return this;
  }

  public validate(validate: IValidateParams): IRouteAdd {
    Object.assign(this.curentRoute.options.validate, validate);
    return this;
  }

  public handler(action: HandlerActionParams): IRouteBuild {
    this.curentRoute.handler = async (request: any, h: any) => {
      return safeCall(request, async (user: any) => {
        return await action(request, h, user);
      });
    };
    return this;
  }

  public build() {
    this.routes.push(this.curentRoute);
  }

  public buildRoutes() {
    return this.routes;
  }

  protected defaultAuthHeader = Joi.object({
    authorization: Joi.string().required().description("jwt token"),
  })
    .unknown(true)
    .options({ allowUnknown: true });

  protected defaultAutAppKeyhHeader = Joi.object({
    appkey: Joi.string().required().description("application key"),
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
    id: Joi.any().required().description("id of the entity"),
  });
}
