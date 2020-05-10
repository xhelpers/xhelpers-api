import * as Joi from "@hapi/joi";
import * as jwt from "jsonwebtoken";

import BaseRouteSimple from "../../base-route-simple";

const httpResourcePath = "todos";

class TodoRoutes extends BaseRouteSimple {
  constructor() {
    super([httpResourcePath]);

    this.route(
      "GET",
      `/api/auth`,
      {
        description: "Create new JWT to tests API",
        tags: ["api", "auth"],
      },
      false
    )
      .handler(async (r, h, u) => {
        const token = jwt.sign(
          {
            user: {
              id: "99999",
            },
          },
          "SecretTests",
          {
            issuer: "ApiTesterIssuer",
            expiresIn: "2h",
          }
        );

        return h
          .response({
            token: token,
          })
          .code(200);
      })
      .build();

    this.route(
      "GET",
      `/api/${httpResourcePath}`,
      {
        description: "Search 'Todos'",
      },
      false
    )
      .validate({ query: todoDemoPayload })
      .handler(async (r, h, u) => {
        return h.response([r.query]).code(200);
      })
      .build();

    this.route("GET", `/api/${httpResourcePath}/{id}`, {
      description: "Get 'Todo' by id",
    })
      .validate({ params: this.defaultIdProperty })
      .handler(async (r, h, u) => {
        return h.response(r.params).code(200);
      })
      .build();

    this.route(
      "POST",
      `/api/${httpResourcePath}`,
      {
        description: "Create new 'Todo'",
      },
      false
    )
      .validate({ payload: todoDemoPayload })
      .handler(async (r, h, u) => {
        return h.response(r.payload).code(200);
      })
      .build();

    this.route("PATCH", `/api/${httpResourcePath}/{id}`, {
      description: "Update 'Todo' by id",
    })
      .validate({ params: this.defaultIdProperty, payload: todoDemoPayload })
      .handler(async (r, h, u) => {
        return h
          .response({
            ...r.params,
            ...(r.payload as {}),
          })
          .code(200);
      })
      .build();

    this.route("PUT", `/api/${httpResourcePath}/{id}`, {
      description: "Replace 'Todo' by id",
    })
      .validate({ params: this.defaultIdProperty, payload: todoDemoPayload })
      .handler(async (r, h, u) => {
        return h
          .response({
            ...r.params,
            ...(r.payload as {}),
          })
          .code(200);
      })
      .build();

    this.route("DELETE", `/api/${httpResourcePath}/{id}`, {
      description: "Delete 'Todo' by id",
    })
      .validate({ params: this.defaultIdProperty })
      .handler(async (r, h, u) => {
        return h
          .response({
            ...r.params,
          })
          .code(200);
      })
      .build();
  }
}

// ****
// Model validation Joi
const todoDemoPayload = Joi.object({
  title: Joi.string()
    .required()
    .description("Title"),
  description: Joi.string()
    .required()
    .description("Description"),
  done: Joi.boolean()
    .required()
    .default(false)
    .description("Todo is done"),
})
  .description("Todo payload")
  .label("TodoPayload");

module.exports = [...new TodoRoutes().buildRoutes()];
