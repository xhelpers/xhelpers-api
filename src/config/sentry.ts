export interface ISentryOptions {
  dsn: string;
  ignoreStatusCode?: number[];
  ignoreRoutes?: string[];
  remoteAddressHeader?: string;
  version?: string;
}
