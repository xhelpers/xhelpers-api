import * as jwt from "jsonwebtoken";

import { IBaseService } from "./contracts/IBaseService";
import { Model } from "sequelize-typescript";
import { db } from "./db-sequelize";

type NonAbstract<T> = { [P in keyof T]: T[P] };
type Constructor<T> = new () => T;
type NonAbstractTypeOfModel<T> = Constructor<T> & NonAbstract<typeof Model>;

export default abstract class BaseServiceSequelize<T extends Model<T>>
  implements IBaseService {
  repository: any;
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

  protected parseSortAsJson(pagination: {
    page: number;
    limit: number;
    sort: any;
  }) {
    if (!pagination.sort) return {};
    let sortQuery: {};
    try {
      sortQuery = JSON.parse(pagination.sort);
    } catch (error) {
      console.log("Invalid sort parameter", error.message);
      throw 'Invalid parameter "sort", it MUST be a valid JSON / sort sintax';
    }
    return sortQuery;
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

  protected async getJwtToken(user: any) {
    const options = {
      issuer: process.env.JWT_ISSUER,
      expiresIn: process.env.JWT_EXPIRE
    };
    return jwt.sign(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          firstAccessAt: user.firstAccessAt,
          updatedAt: user.updatedAt
        }
      },
      "options.jwt_secret",
      options
    );
  }

  protected async validateJwtToken(token: string) {
    const options = {
      issuer: process.env.JWT_ISSUER,
      expiresIn: process.env.JWT_EXPIRE
    };
    return jwt.verify(token, "options.jwt_secret", options);
  }

  public async queryAll(
    user: any,
    query: { filter: any; fields: any } = {
      filter: {},
      fields: []
    },
    pagination: { page: number; limit: number; sort: any } = {
      page: 1,
      limit: 10,
      sort: { _id: -1 }
    },
    populateOptions: { path: string | any; select?: string | any } = {
      path: null
    }
  ): Promise<T[]> {
    let filter = {};
    let sort = {};
    filter = this.parseFilterAsJson(query.filter);
    sort = this.parseSortAsJson(pagination);

    let select: any = this.sentitiveInfo;
    if (query.fields) {
      select = [];
      for (let index = 0; index < query.fields.length; index++) {
        const field = query.fields[index];
        select.push(`${field}`);
      }
      this.sentitiveInfo.forEach((element: any) => {
        var name = element.replace("-", "");
        select = select.filter((f: any) => f !== name);
      });
    }

    if (Object.keys(sort).length <= 0) {
      sort = { _id: -1 };
    }
    const logLevel = process.env.LOG_LEVEL || "HIGH";
    if (logLevel === "HIGH") {
      console.log("Search params");
      console.log("\t filter:", filter);
      console.log("\t select:", select);
      console.log("\t sort:", sort);
      console.log("\t populateOptions:", populateOptions);
    }

    const skip = (pagination.page - 1) * pagination.limit;
    return await this.repository.findAll({
      limit: pagination.limit,
      offset: skip
    });
    // .populate(populateOptions.path, populateOptions.select)
    // .skip(skip)
    // .limit(pagination.limit)
    // .sort(sort)
    // .select([...select])
    // .lean();
  }
  public async getById(
    user: any,
    id: any,
    projection: any = {},
    populateOptions?: { path: string | any; select?: string | any }
  ): Promise<T> {
    Object.assign(projection, this.sentitiveInfo);
    return await this.repository.findByPk(id);
    // .populate({ ...populateOptions })
    // .select([...projection])
    // .lean();
  }
  public async create(user: any, payload: any): Promise<any> {
    await this.validate(null, payload);
    // try to set common const fields
    payload.createdAt = new Date();
    payload.createdBy = user && user.id;
    var entity = await this.repository.create(payload);
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
