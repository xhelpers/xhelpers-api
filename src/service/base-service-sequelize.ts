import { IBaseService } from "../contracts/IBaseService";
import { db, Model } from "../database/db-sequelize";
import BaseServiceToken from "./base-service-token";
import { Repository } from "sequelize-typescript";

export default abstract class BaseServiceSequelize<T extends Model<T>>
  extends BaseServiceToken
  implements IBaseService
{
  protected repository: Repository<T>;

  protected Model: Repository<T>;

  protected abstract sentitiveInfo: string[];

  constructor(model: Repository<T>) {
    super();
    this.Model = model;
    this.repository = db.sequelize.getRepository(this.Model);
  }

  protected abstract validate(
    entity: Model | null,
    payload: T
  ): Promise<Boolean>;

  protected getRepository<TRepo>(sequelizeModel: TRepo): Repository<T> {
    return db.sequelize.getRepository(sequelizeModel);
  }

  protected parseSortAsJson(sort: any) {
    if (!sort) return [];
    if (typeof sort === "object") return sort;

    let sortFields = {};
    try {
      sortFields = JSON.parse(sort);
    } catch (error) {
      console.log("Invalid sort parameter", error);
      throw Error(
        "Invalid parameter 'sort', it MUST be a valid JSON / sort sintax"
      );
    }
    return sortFields;
  }

  protected parseFilterAsJson(query: any) {
    if (!query) return {};
    if (typeof query === "object") return query;

    let filterQuery = {};
    try {
      filterQuery = JSON.parse(query);
    } catch (error) {
      console.log("Invalid filter parameter", error);
      throw Error(
        "Invalid parameter 'filter', it MUST be a valid JSON / query sintax"
      );
    }
    return filterQuery;
  }

  protected parseLimitAndOffset(field: any, name: string) {
    if (!field) {
      if (name == "limit") return 10;
      return 0;
    }
    if (typeof field === "number") return field;

    let parseField = 0;
    try {
      parseField = parseInt(field.toString());
    } catch (error) {
      console.log("Invalid limit or offset parameter", error);
      throw Error(
        "Invalid parameter 'limit' or 'offset', it MUST be a valid JSON / sintax"
      );
    }
    return parseField;
  }

  public async queryAll(
    user: any,
    query: { filter: any; fields: any } = {
      filter: {},
      fields: [],
    },
    pagination: { offset: number; limit: number; sort: any } = {
      offset: 1,
      limit: 10,
      sort: [],
    },
    populateOptions: { path: string | any; select?: string | any } = {
      path: null,
    }
  ): Promise<{
    metadata: {
      resultset: {
        count: number;
        offset: number;
        limit: number;
      };
    };
    results: T[];
  }> {
    const filter: any = this.parseFilterAsJson(query.filter);
    const sort: [] = this.parseSortAsJson(pagination.sort);
    const limit: number = this.parseLimitAndOffset(pagination.limit, "limit");
    const offset: number = this.parseLimitAndOffset(pagination.offset, "sort");

    let select: any = this.Model.getAttributes();
    if (query.fields) {
      select = [];
      for (const field of query.fields.split(",")) {
        select.push(field);
      }
      this.sentitiveInfo.forEach((element: any) => {
        const name = element.replace("-", "");
        select = select.filter((f: any) => f !== name);
      });
    }

    const data = await this.repository.findAll({
      where: filter,
      attributes: select,
      order: sort,
      limit,
      offset,
    });

    const result = {
      metadata: {
        resultset: {
          count: data.length,
          offset: pagination.offset,
          limit: pagination.limit,
        },
      },
      results: data,
    };
    return Promise.resolve(result);
  }

  public async getById(
    user: any,
    id: any,
    projection: any = {},
    populateOptions?: { path: string | any; select?: string | any }
  ): Promise<T | null> {
    Object.assign(projection, this.sentitiveInfo);
    return await this.repository.findByPk(id);
  }

  public async create(user: any, payload: any): Promise<any> {
    await this.validate(null, payload);
    // try to set common const fields
    payload.createdAt = new Date();
    payload.createdBy = user && user.id;
    const entity = await this.repository.create(payload);
    return {
      id: entity.id,
    };
  }

  public async update(user: any, id: any, payload: T): Promise<any> {
    const entity: any = await this.repository.findByPk(id);
    if (!entity) throw Error("Entity not found");
    await this.validate(entity, payload);
    Object.assign(entity, payload);
    // try to set common const fields
    entity.updatedAt = new Date();
    entity.updatedBy = user && user.id;
    await entity.save();
    return {
      id: entity.id,
    };
  }

  public async delete(user: any, id: any): Promise<void> {
    const entity = await this.repository.findByPk(id);
    if (!entity) throw Error("Entity not found");
    await this.repository.findByPk(id).then((entity: any) => entity.destroy());
  }
}

export { Repository };
