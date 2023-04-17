export interface ISwaggerOptions {
  info: {
    title: string;
    version: string;
    contact?: {
      name: string;
      email: string;
    };
  };
  grouping?: string;
  tags?: Array<any>;
  [key: string]: any;
}
