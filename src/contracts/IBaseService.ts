export interface IBaseService {
  queryAll(
    user: any,
    query?: any,
    pagination?: {
      offset: number;
      limit: number;
      sort: any;
    },
    populateOptions?: {
      path: string | any;
      select?: string | any;
    }
  ): Promise<{
    metadata: {
      resultset: {
        count: number;
        offset: number;
        limit: number;
      };
    };
    results: any[];
  }>;
  getById(
    user: any,
    id: any,
    projection: any,
    populateOptions?: {
      path: string | any;
      select?: string | any;
    }
  ): Promise<any>;
  create(user: any, payload: any): Promise<any>;
  update(user: any, id: any, payload: any): Promise<any>;
  delete(user: any, id: any): Promise<any>;
}
