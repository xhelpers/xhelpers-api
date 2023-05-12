export interface ICronJob {
  name: string;
  time: string;
  timezone: string;
  request: {
    method: string;
    url: string;
    params?: any;
    query?: any;
    payload?: any;
    headers?: any;
    [key: string]: any;
  };
  onComplete: (res: any) => void;
}
