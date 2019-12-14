# XHelpers - API

[![forthebadge](https://forthebadge.com/images/badges/built-by-developers.svg)](http://forthebadge.com) [![forthebadge](https://forthebadge.com/images/badges/powered-by-electricity.svg)](http://forthebadge.com)[![forthebadge](https://forthebadge.com/images/badges/reading-6th-grade-level.svg)](http://forthebadge.com)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)[![Awesome](https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg)](https://github.com/sindresorhus/awesome)

## Description

This project was made for personal use, it should simplify the process of creating an new api using node js + typescript + singledb(mongo or mysql).

Stacks:

- [TypeScript](https://www.typescriptlang.org/).
- [Node.js](https://nodejs.org/).
- [Mongodb](https://www.mongodb.com/).
- [Mongoose](https://mongoosejs.com/).
- [MySQL](https://www.mysql.com/).
- [Sequelize](https://sequelize.org/).
- [Hapi](https://hapi.dev/).
- [Boom](https://github.com/hapijs/boom).
- [JWT](https://github.com/dwyl/hapi-auth-jwt2).
- [SSO bell](https://github.com/hapijs/bell).
- [Hapi-swagger](https://github.com/glennjones/hapi-swagger).

## Installation

```bash
$ npm i
```

## Examples of usage

### Hapi Server

```code
server = await createServer({
    serverOptions: {
      port: process.env.PORT,
      host: process.env.HOST
    },
    options: {
      enableSSL: process.env.SSL === "true",
      swaggerOptions: {
        jsonPath: "/api/documentation/swagger.json",
        documentationPath: "/api/documentation",
        swaggerUIPath: "/api/swaggerui/",
        info: {
          title: "API",
          version: "1.3"
        },
        grouping: "tags",
        tags: [
          {
            name: "account",
            description: "Account API operations"
          }
        ]
      },
      routeOptions: {},
      jwt_secret: "v3ryH4rdS3cr3t",
      mongodb: {
        uri: "",
        connectionOptions: {}
      },
      mysql: {
        sequelizeOptions: {}
      },
      enableSSO: false,
      ssoCallback: null
    }
  });
  await server.start();
```

>

### Routes

```code
import Service from "/services/account-login";

const httpResourcePath = "account-login";

class RouteAccountLogin extends BaseRoute<Service> {
  constructor() {
    super(new Service(), [httpResourcePath]);

    this.route("POST", `/api/${httpResourcePath}`)
      .validate({ payload: createPayload })
      .handler(async (r, h, u) => {
        const entity = await this.service.create(u, r.payload);
        return h.response(entity).code(200);
      })
      .build();

    this.route("GET", `/api/${httpResourcePath}`)
      .validate({ query: this.defaultSearchQuery })
      .handler(async (r, h, u) => {
        return await this.service
          .queryAll(
            u,
            {
              filter: r.query.filter,
              fields: r.query.fields
            },
            {
              page: r.query.page,
              limit: r.query.limit,
              sort: r.query.sort
            }
          )
          .then(entities => h.response(entities).code(200));
      })
      .build();

    this.route("GET", `/api/${httpResourcePath}/{id}`)
      .validate({ params: this.defaultIdProperty })
      .handler(async (r, h, u) => {
        return await this.service
          .getById(u, r.params.id)
          .then(entity =>
            entity ? h.response(entity).code(200) : Boom.notFound()
          );
      })
      .build();

    this.route("PUT", `/api/${httpResourcePath}/{id}`)
      .validate({ params: this.defaultIdProperty, payload: createPayload })
      .handler(async (r, h, u) => {
        return await this.service
          .update(u, r.params.id, r.payload)
          .then(() => h.response({}).code(200));
      })
      .build();

    this.route("DELETE", `/api/${httpResourcePath}/{id}`)
      .validate({ params: this.defaultIdProperty })
      .handler(async (r, h, u) => {
        return await this.service
          .delete(u, r.params.id)
          .then(() => h.response({}).code(200));
      })
      .build();
  }
}
exports.routes = server => server.route(new RouteAccountLogin().buildRoutes());
```

### Service

```code
// mongoose
export default class AccountLoginService extends BaseServiceMongoose<
  AccountLogin
> {
  constructor() {
    super(AccountLogin);
  }
  sentitiveInfo = ["-__v", "password"];
  protected async validate(entity: AccountLogin, payload: AccountLogin) {
    const invalid = false;
    if (invalid) throw new Error("Invalid payload.");
    return Promise.resolve();
  }
}

// sequelize
export default class AccountLoginService extends BaseServiceSequelize<
  AccountLogin
> {
  constructor() {
    super(AccountLogin);
  }
  sentitiveInfo = ["password"];
  protected async validate(entity: AccountLogin, payload: AccountLogin) {
    const invalid = false;
    if (invalid) throw new Error("Invalid payload.");
    return Promise.resolve();
  }
}
```

### Safe call

```code
// safeCall(
//  request: { method: any; path: any; auth: { credentials: { user: any } } },
//  action: { (user: any): Promise<any>; (arg0: any): Promise<any> }
// )

    safeCall(request, async (user: any) => {
        return await action(request, h, user);
      })
```

## Building

```bash
# build tsc
$ npm run build
```

## Test

[Pending]

## Support

[Pending]

## Stay in touch

- Author - [wmkdev](https://github.com/wmkDev)

## License
