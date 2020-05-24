import * as jwt from "jsonwebtoken";

import { IBaseService } from "./contracts/IBaseService";
import { Model } from "sequelize-typescript";
import { db } from "./db-sequelize";

type NonAbstract<T> = { [P in keyof T]: T[P] };
type Constructor<T> = new () => T;
type NonAbstractTypeOfModel<T> = Constructor<T> & NonAbstract<typeof Model>;

export default abstract class BaseServiceSequelize<T extends Model<T>>
  implements IBaseService {
  protected repository: NonAbstractTypeOfModel<T>;
  constructor(model: NonAbstractTypeOfModel<T>) {
    this.Model = model;
    this.repository = db.sequelize.getRepository(this.Model);
  }
  protected Model: NonAbstractTypeOfModel<T>;
  protected abstract async validate(
    entity: Model | null,
    payload: T
  ): Promise<Boolean>;
  protected abstract sentitiveInfo = [];

  protected getRepository<TRepo>(sequelizeModel: TRepo): any {
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
      throw 'Invalid parameter "sort", it MUST be a valid JSON / sort sintax';
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
      throw 'Invalid parameter "filter", it MUST be a valid JSON / query sintax';
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
      throw 'Invalid parameter "limit" or "offset", it MUST be a valid JSON / sintax';
    }
    return parseField;
  }

  // todo: should receive action !!
  protected async getJwtToken(user: any) {
    const options = {
      issuer: process.env.JWT_ISSUER,
      expiresIn: process.env.JWT_EXPIRE
    };
    return jwt.sign(
      {
        user
      },
      process.env.JWT_SECRET || ".",
      options
    );
  }

  protected async validateJwtToken(token: string) {
    const options = {
      issuer: process.env.JWT_ISSUER,
      expiresIn: process.env.JWT_EXPIRE
    };
    return jwt.verify(token, process.env.JWT_SECRET || "", options);
  }

  public async queryAll(
    user: any,
    query: { filter: any; fields: any } = {
      filter: {},
      fields: []
    },
    pagination: { offset: number; limit: number; sort: any } = {
      offset: 1,
      limit: 10,
      sort: []
    },
    populateOptions: { path: string | any; select?: string | any } = {
      path: null
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
    let filter = {};
    let sort = [];
    let limit: number;
    let offset: number;

    filter = this.parseFilterAsJson(query.filter);
    sort = this.parseSortAsJson(pagination.sort);
    limit = this.parseLimitAndOffset(pagination.limit, "limit");
    offset = this.parseLimitAndOffset(pagination.offset, "sort");

    let select: any = this.Model.rawAttributes;
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

    const logLevel = process.env.LOG_LEVEL || "HIGH";
    if (logLevel === "HIGH") {
      console.log("Search params");
      console.log("\t filter:", filter);
      console.log("\t select:", select);
      console.log("\t sort:", sort);
      console.log("\t populateOptions:", populateOptions);
    }

    const data = await this.repository.findAll({
      where: filter,
      attributes: select,
      order: sort,
      limit: limit,
      offset: offset
    });

    const result = {
      metadata: {
        resultset: {
          count: data.length,
          offset: pagination.offset,
          limit: pagination.limit
        }
      },
      results: data
    };
    return Promise.resolve({
      ...result
    });
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
      id: entity.id
    };
  }
  public async update(user: any, id: any, payload: T): Promise<any> {
    const entity: any = await this.repository.findByPk(id);
    if (!entity) throw "Entity not found";
    await this.validate(entity, payload);
    Object.assign(entity, payload);
    // try to set common const fields
    entity.updatedAt = new Date();
    entity.updatedBy = user && user.id;
    await entity.save();
    return {
      id: entity.id
    };
  }
  public async delete(user: any, id: any): Promise<void> {
    const entity = await this.repository.findByPk(id);
    if (!entity) throw "Entity not found";
    await this.repository.findByPk(id).then((entity: any) => entity.destroy());
  }
}
