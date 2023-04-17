import { IOptions } from "./options";

export interface IServerOptions {
  port?: number | string;
  host?: string;
  [key: string]: any;
}

export interface ICreateServerOptions {
  serverOptions: IServerOptions;
  options: IOptions;
}

export interface IRouteOptions {
  routes: string;
}
