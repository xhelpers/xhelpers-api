import * as jwt from "jsonwebtoken";
import * as mongoose from "mongoose";

import { IBaseService } from "./contracts/IBaseService";

export default abstract class BaseServiceMongoose<T extends mongoose.Document>
  implements IBaseService {
  constructor(model: mongoose.Model<T>) {
    this.Model = model;
  }
  protected Model: mongoose.Model<mongoose.Document>;
  protected abstract async validate(entity: mongoose.Document, payload: T);
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
      throw 'Invalid parameter "sort", it MUST be a valid JSON / Mongo sort sintax';
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
      throw 'Invalid parameter "filter", it MUST be a valid JSON / Mongo query sintax';
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
      process.env.JWT_SECRET,
      options
    );
  }

  protected async validateJwtToken(token: string) {
    const options = {
      issuer: process.env.JWT_ISSUER,
      expiresIn: process.env.JWT_EXPIRE
    };
    return jwt.verify(token, process.env.JWT_SECRET, options);
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
      this.sentitiveInfo.forEach(element => {
        var name = element.replace("-", "");
        select = select.filter(f => f !== name);
      });
    }

    const skip = (pagination.page - 1) * pagination.limit;
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

    return await this.Model.find(filter)
      .populate(populateOptions.path, populateOptions.select)
      .skip(skip)
      .limit(pagination.limit)
      .sort(sort)
      .select([...select])
      .lean();
  }
  public async getById(
    user: any,
    id: any,
    projection: any = {},
    populateOptions?: { path: string | any; select?: string | any }
  ): Promise<T> {
    Object.assign(projection, this.sentitiveInfo);
    return await this.Model.findById(id)
      .populate({ ...populateOptions })
      .select([...projection])
      .lean();
  }
  public async create(user: any, payload: any): Promise<any> {
    await this.validate(null, payload);
    // try to set common const fields
    payload.createdAt = new Date();
    payload.createdBy = user && user.id;
    var entity = await this.Model.create(payload);
    return {
      id: entity.id
    };
  }
  public async update(user: any, id: any, payload: T): Promise<any> {
    const entity: any = await this.Model.findById(id);
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
    const entity = await this.Model.findById(id).lean();
    if (!entity) throw "Entity not found";
    await this.Model.deleteOne(id);
  }
}
