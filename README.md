# xHelpers API

[![npm](https://nodei.co/npm/xhelpers-api.png)](https://www.npmjs.com/package/xhelpers-api)

[![Node.js Version](https://img.shields.io/node/v/xhelpers-api.svg?style=flat-square "Node.js 18")](http://nodejs.org/download/)
[![hapi 21.3.0](https://img.shields.io/badge/hapi-21.3.0-brightgreen.svg?style=flat-square "Latest Hapi.js")](http://nodejs.org/download/)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/d4cf77276a6f463f9b1a097f5d0adcfc)](https://www.codacy.com/gh/wmkDev/xhelpers-api/dashboard?utm_source=github.com&utm_medium=referral&utm_content=wmkDev/xhelpers-api&utm_campaign=Badge_Grade)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/d4cf77276a6f463f9b1a097f5d0adcfc)](https://www.codacy.com/gh/wmkDev/xhelpers-api/dashboard?utm_source=github.com&utm_medium=referral&utm_content=wmkDev/xhelpers-api&utm_campaign=Badge_Coverage)

![GitHub repo size](https://img.shields.io/github/repo-size/wmkdev/xhelpers-api)
![GitHub issues](https://img.shields.io/github/issues/wmkdev/xhelpers-api)
![GitHub pull requests](https://img.shields.io/github/issues-pr/wmkdev/xhelpers-api)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/wmkdev/xhelpers-api)

![Node.js Build](https://github.com/wmkDev/xhelpers-api/workflows/Node.js%20Build/badge.svg?branch=master)
![npm](https://img.shields.io/npm/dw/xhelpers-api)
[![HitCount](http://hits.dwyl.com/wmkdev/xhelpers-api.svg)](http://hits.dwyl.com/wmkdev/xhelpers-api)

![GitHub package.json dynamic](https://img.shields.io/github/package-json/keywords/wmkdev/xhelpers-api)

<p align="center">  
  <img src="docs/logo.png" />
</p>

## Description

Xhelpers is an open source project that enables developers to easily create and manage micro-services into their own environment. It provides a complete suite of easy-to-use tools to help developers quickly create, manage and deploy micro-services.

- The project is a collection of libraries and tools that can be used to create and deploy micro-services. It has a comprehensive suite of features such as ORM/ODM (Sequelize, Mongoose), API SSL, API SSO (Github, Facebook, Google), API security (JWT, AppKey), API logging (AWS, Sentry), API documentation (Swagger), API queue operator (AMQP, RabbitMQ).

- The project has a CLI tool with usefull functions, check it out: [xhelpers-cli](https://github.com/xhelpers/xhelpers-cli).

- The project is actively maintained and updated to provide the best experience for developers. It is an open source project and anyone can contribute to it and help make it even better.

### Stack

- [TypeScript 4.9.5](https://www.typescriptlang.org/).
- [Node.js 18.14.1](https://nodejs.org/).
- [Hapi 21.3.0](https://hapi.dev/).
- [Mongoose 6.9.2](https://mongoosejs.com/).
- [Sequelize 6.28.0](https://sequelize.org/).

## Roadmap

- Improve documentation
- Add more samples

## Installation

```bash
$ npm i xhelpers-api
```

## Usage

Default project folder structure:

```
my-micro-service/
├─ node_modules/
├─ src/
│  ├─ index.ts
├──├─ routes/
│  ├─ todo.route.ts
├──├─ services/
│  ├─ todo.service.ts
├──├─ model/
│  ├─ todo.model.ts
├─ package.json
├─ package-lock.json
├─ README.md
├─ .gitignore
```

### Server

Create a new file located on **'src/index.ts'**

```code
import { createServer } from "xhelpers-api/lib/server";
import { dotenv } from "xhelpers-api/lib/tools";

dotenv.config();
const pkgJson = require("../package.json");

let server: any = {};
export default async function start() {
  const serverOptions: any = {
    port: 5000,
    host: process.env.HOST || "127.0.0.1",
  };
  const options: any = {
    jwt_secret: "v3ryH4Rds3cr3t",
    swaggerOptions: {
      info: {
        title: "Test API",
        version: "1.0",
        contact: {
          name: "todo test",
          email: "tester@test.com",
        },
      },
      schemes: [process.env.SSL === "true" ? "https" : "http"],
      grouping: "tags",
    },
    routeOptions: {
      routes: "**/routes/*.route.js",
    }
  };
  server = await createServer({ serverOptions, options });
  await server.start();
  return server;
}

if (typeof require !== "undefined" && require.main === module) {
	start();
}
```

### Route

Create a new file located on **'src/routes/todo.route.ts'**

```code
import { Joi, jwt, Boom } from "xhelpers-api/lib/tools";
import { BaseRouteSimple } from "xhelpers-api/lib/service";

class TodoRoutes extends BaseRouteSimple {
  constructor() {
    super(["todos"]);

    this.route("GET",`/api/todos`,{
        description: "Search 'Todos'",
      },
      false
    )
      .validate({ query: todoDemoPayload })
      .handler(async (r, h, u) => {
        return h.response([r.query]).code(200);
      })
      .build();

    this.route("POST", `/api/todos`, {
        description: "Create new 'Todo'",
      },
      false
    )
      .validate({ payload: todoDemoPayload })
      .handler(async (r, h, u) => {
        return h.response(r.payload).code(200);
      })
      .build();

    this.route("PATCH", `/api/todos/{id}`, {
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
  }
}

// Joi Schema, can be used on routes to validate: params, query, payload etc...
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
```

### Service

Create a new file located on **'src/services/todo.service.ts'**

```code
import AccountLogin from "/model/account_login"; // mongoose or sequelize "Model"
import { BaseServiceMongoose, BaseServiceSequelize, BaseRabbitOperator } from "xhelpers-api/lib/service";

// mongoose
export class AccountLoginService extends BaseServiceMongoose<AccountLogin> {
  constructor() {
    super(AccountLogin);
  }
  sentitiveInfo: any = ["-__v", "password"];
  protected async validate(entity: AccountLogin, payload: AccountLogin): Promise<boolean> {
    const invalid = false;
    if (invalid) throw new Error("Invalid payload.");
    return Promise.resolve(true);
  }
}

// sequelize
export class AccountLoginSqlService extends BaseServiceSequelize<AccountLogin> {
  constructor() {
    super(AccountLogin);
  }
  sentitiveInfo: any = ["id"];
  protected async validate(
    entity: AccountLogin,
    payload: AccountLogin
  ): Promise<boolean> {
    const invalid = false;
    if (invalid) throw new Error("Invalid payload.");
    return Promise.resolve(true);
  }
}
```

### Models - Mongoose / Sequelize

### Mongoose: account_login

```code
import * as mongoose from 'mongoose';

export interface AccountLogin extends mongoose.Document {
  ip_number: string;
  browser: string;
  created_at: Date;
}

const schema = new mongoose.Schema({
  ip_number: { type: String , required: true},
  browser: { type: String },
  created_at: { type: Date, required: true },
});

schema.set('toJSON', { virtuals: true });

export default mongoose.model<AccountLogin>('AccountLogin', schema, 'account_login');
```

### Sequelize: account_login

```code
import {
  BelongsTo,
  Column,
  CreatedAt,
  ForeignKey,
  Model,
  Scopes,
  Table
} from "sequelize-typescript";

@Scopes(() => ({}))
@Table({ tableName: "account_login", updatedAt: false })
export default class AccountLogin extends Model<AccountLogin> {
  @Column
  ip_number: string;
  @Column
  browser: string;
  /* auto */
  @CreatedAt
  @Column
  created_at: Date;
}
```

### Sequelize: Using parameters in route "queryAll"

```
?
fields=
&offset=
&limit=
&sort=[["", "ASC|DESC"]]
&filter={"":""}
```

- **fields**: Select the existing fields in model, comma separeted.

- **offset**: To skip lines before starting to return the lines.

  > OFFSET 0 is the same as omitting the OFFSET parameter

- **limit**: If the limit is specified, no more than this number of lines will be returned.

  > When using LIMIT it is important to use the SORT parameter to establish a single order for the result lines

- **filter**: Select the existing fields in model and values filter, based in JSON.

  > Example: filter=[{"field name":, "field value"}]
  >
  > Template based on sequelize: [Applyng where clauses](https://sequelize.org/master/manual/model-querying-basics.html#applying-where-clauses)

- **sort**: Select the existing fields in the model to order the result, based in JSON.

  > Example: sort=[["field name": "ASC|DESC"]]
  >
  > Template based on sequelize: [Ordering and grouping](https://sequelize.org/master/manual/model-querying-basics.html#ordering-and-grouping)

#### Output of running server:

```code
Starting Xhelpers Hapi server API
Settings API: Mongoose disabled;
Settings API: Sequelize disabled;
Settings API: SSL disabled;
Settings API: AppKey disabled;
Settings API: JWT enabled;
Settings API: SSO disabled;
====================================================================================================
🆙  xhelpers-api  : 4.0.0
🆙  Server doc    : http://127.0.0.1:5000/documentation
🆙  Server api    : http://127.0.0.1:5000/
====================================================================================================
Routing table:
        🔎  get -         /documentation
        🔎  get -         /health
        🔎  get -         /status
        🔎  get -         /swagger.json
        🔎  get -         /api/auth
        🔎  get -         /api/todos
        🔎  get -    🔑   /api/todos/{id}
        📄  post -        /api/todos
        📝  patch -  🔑   /api/todos/{id}
        📝  put -    🔑   /api/todos/{id}
        🚩  delete - 🔑   /api/todos/{id}
====================================================================================================
```

## Default Routes

```code
🆙  Server doc    : http://127.0.0.1:5000/documentation
🆙  Server health : http://127.0.0.1:5000/health
```

### Swagger /documentation

![Status](docs/swagger.docs.png)

## Building

```bash
# build tsc
$ npm run build
```

## Test

```bash
$ npm run test
```

## Test Coverage

```bash
$ npm run test:coverage
$ npm run cover:report
```

## License
