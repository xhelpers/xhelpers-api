export interface IMongooseOptions {
  uri: string;
  connectionOptions?: any;
  strictQuery?: boolean;
  [key: string]: any;
}
