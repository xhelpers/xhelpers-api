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

## Description

xhelpers-api is an open-source project that aims to simplify the implementation of RESTful APIs. It provides a set of helper functions and plugins to help developers build efficient, secure, and scalable APIs. This documentation will guide you through the different sections and configurations of the project..

- The project is a collection of libraries and tools that can be used to create and deploy micro-services. It has a comprehensive suite of features such as ORM/ODM (Sequelize, Mongoose), API SSL, API SSO (Github, Facebook, Google), API security (JWT, AppKey), API logging (AWS, Sentry), API documentation (Swagger), API queue operator (AMQP, RabbitMQ).

- The project has a CLI tool with usefull functions, check it out: [xhelpers-cli](https://github.com/xhelpers/xhelpers-cli).

- The project is actively maintained and updated to provide the best experience for developers. It is an open source project and anyone can contribute to it and help make it even better.

### Stack

- [TypeScript 4.9.5](https://www.typescriptlang.org/).
- [Node.js 18.14.1](https://nodejs.org/).
- [Hapi 21.3.0](https://hapi.dev/).
- [Mongoose 6.10.0](https://mongoosejs.com/).
- [Sequelize 6.29.0](https://sequelize.org/).

## Roadmap

- Improve documentation
- Add more samples

# Getting Started

To start using xhelpers-api in your project, you need to install it as a dependency:

```bash
$ npm i xhelpers-api
```

# Configuration

xhelpers-api allows you to configure different aspects of your API, such as logging, database connections, and security settings. To configure these settings, you can use the options on the method `createServer`.

## Example: Microservice API using xhelpers-api in a single file

Here's an minified example of a microservice API using xhelpers-api:

```js
import { createServer } from "xhelpers-api/lib/server";
import { BaseRouteSimple } from "xhelpers-api/lib/route";
import { Boom, uuid, Joi, dotenv } from "xhelpers-api/lib/tools";

dotenv.config();

class RequestService {
	async createJob(u: any, server: any): Promise<string | Boom.Boom> {
		return uuid.v4();
	}
}

class Routes extends BaseRouteSimple {
	constructor(private service = new RequestService()) {
		super(["api", "Jobs"]);
		this.route("POST", "/api/jobs", {}, false)
			.validate({
				payload: Joi.object({
					id: Joi.string().required().description("id"),
				}),
			})
			.handler(async (r, h, u) => {
				const result = await this.service.createJob(u, r.server);
				return Boom.isBoom(result) ? result : h.response(result).code(200);
			})
			.build();
	}
}

export const start = async () => {
	// create hapijs server with xhelpers options
	const server = await createServer({
		serverOptions: {},
		options: {
			swaggerOptions: {
				info: {
					title: "Minified demo",
					version: "1.0",
				},
			},
			routeOptions: { routes: "" },
		},
	});
	// register local routes
	server.route(new Routes().buildRoutes());
	// start server
	server.start();
	return server;
};

start();
```

## Key Components

### createServer

The createServer function from the xhelpers-api/lib/server module is used to create a HapiJS server with the provided xhelpers-api options.

```js
import { createServer } from "xhelpers-api/lib/server";
```

### BaseRouteSimple

The BaseRoute/BaseRouteSimple class from the xhelpers-api/lib/route module is used to define routes and their handlers. It provides a simple and organized way to manage routes.

```js
import { BaseRouteSimple } from "xhelpers-api/lib/route";
```

### Tools

The xhelpers-api/lib/tools module provides a set of utilities and tools that simplify common tasks, such as generating UUIDs, validating payloads using Joi, and handling errors with Boom.

```js
import { Boom, uuid, Joi, dotenv } from "xhelpers-api/lib/tools";
```

## Defining Services

You can define services by creating a class and implementing the required methods. In the example above, a RequestService class is defined with a createJob method.

```js
class RequestService {
  async createJob(u: any, server: any): Promise<string | Boom.Boom> {
    return uuid.v4();
  }
}
```

## Defining Routes

Routes can be defined by extending the BaseRoute/BaseRouteSimple class and implementing the required routes. In the example above, a Routes class is defined with a single route for creating a job.

```js
class Routes extends BaseRouteSimple {
	constructor(private service = new RequestService()) {
		super(["api", "Jobs"]);
		this.route("POST", "/api/jobs", {}, false)
			.validate({
				payload: Joi.object({
					id: Joi.string().required().description("id"),
				}),
			})
			.handler(async (r, h, u) => {
				const result = await this.service.createJob(u, r.server);
				return Boom.isBoom(result) ? result : h.response(result).code(200);
			})
			.build();
	}
}
```

# Starting the Server

The server is started by calling the start function, which initializes the server with the provided options, registers the routes, and starts the server.

```js
const server = await createServer({
  serverOptions: {},
  options: { routeOptions: { routes: "" } },
});
server.start();
```

#### Output of running server:

```code
Starting Xhelpers Hapi server API
Settings API: Mongoose disabled;
Settings API: Sequelize disabled;
Settings API: SSL disabled;
Settings API: SSO disabled;
Settings API: JWT disabled;
Settings API: AppKey disabled;
Settings API: CronJobs disabled;
Settings API: Sentry disabled;
====================================================================================================
🆙  Server doc    : http://localhost:5000/documentation
🆙  Server api    : http://localhost:5000/
====================================================================================================
Routing table:
        🔎  get -       /documentation
        🔎  get -       /swagger.json
        🔎  get -       /health
        🔎  get -       /liveness
        📄  post -      /api/jobs
====================================================================================================
```

## Default Routes

```code
🆙  Server doc    : http://127.0.0.1:5000/documentation
🆙  Server health : http://127.0.0.1:5000/health
🆙  Server health : http://127.0.0.1:5000/liveness
```

## Examples

You can find example code in the examples directory of the [xhelpers-api GitHub repository](https://github.com/xhelpers/xhelpers-api/network/dependents). These examples demonstrate how to use the different features and configurations of xhelpers-api in a real-world scenario.

Feel free to explore these examples and use them as a reference when building your own APIs with xhelpers-api.

# Building/Contributing

Contributions to xhelpers-api are welcome! Please refer to the CONTRIBUTING.md file for detailed guidelines on submitting pull requests, reporting issues, and more.

If you have any questions or need assistance, feel free to open an issue on the xhelpers-api GitHub repository.

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
