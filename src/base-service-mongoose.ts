import * as jwt from "jsonwebtoken";
import * as mongoose from "mongoose";

import { IBaseService } from "./contracts/IBaseService";

export default abstract class BaseServiceMongoose<T extends mongoose.Document>
  implements IBaseService {
  constructor(model: mongoose.Model<T>) {
    this.Model = model;
  }
  protected Model: mongoose.Model<mongoose.Document>;
  protected abstract validate(
    entity: mongoose.Document | null,
    payload: T
  ): Promise<Boolean>;
  protected abstract sentitiveInfo = [];

  protected parseAsJSON(field: any) {
    if (!field) return {};
    if (typeof field === "object") return field;

    let auxField = {};
    try {
      auxField = JSON.parse(field);
    } catch (error) {
      console.log("Invalid filter parameter", error);
      throw 'Invalid parameter "field" it should be a valid JSON';
    }
    return auxField;
  }

  protected async getJwtToken(user: any) {
    const options = {
      issuer: process.env.JWT_ISSUER,
      expiresIn: process.env.JWT_EXPIRE,
    };
    return jwt.sign(
      {
        user,
      },
      process.env.JWT_SECRET || "",
      options
    );
  }

  protected async validateJwtToken(token: string) {
    const options = {
      issuer: process.env.JWT_ISSUER,
      expiresIn: process.env.JWT_EXPIRE,
    };
    return jwt.verify(token, process.env.JWT_SECRET || "", options);
  }

  public async queryAll(
    user: any = {},
    query: { filter: any; fields: any } = {
      filter: {},
      fields: [],
    },
    pagination: { offset: number; limit: number; sort: any } = {
      offset: 0,
      limit: 10,
      sort: { _id: -1 },
    },
    populateOptions: { path: string | any; select?: string | any, virtuals?: boolean | string[] } = {
      path: null,
      virtuals: false
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
    let filter = this.parseAsJSON(query.filter);
    let sort = this.parseAsJSON(pagination.sort);

    let select: any = this.sentitiveInfo;
    if (query.fields) {
      select = [];
      for (let index = 0; index < query.fields.length; index++) {
        const field = query.fields[index];
        select.push(`${field}`);
      }
      this.sentitiveInfo.forEach((element: any) => {
        const name = element.replace("-", "");
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

    const data: any = await this.Model.find(filter)
      .populate(populateOptions.path, populateOptions.select)
      .skip(pagination.offset)
      .limit(pagination.limit)
      .sort(sort)
      .select([...select])
      .lean({ virtuals: populateOptions.virtuals });

    const count = await this.Model.countDocuments(filter);

    const result = {
      metadata: {
        resultset: {
          count: count,
          offset: pagination.offset,
          limit: pagination.limit,
        },
      },
      results: data,
    };
    return Promise.resolve({
      ...result,
    });
  }
  public async getById(
    user: any,
    id: any,
    projection: any[] = [],
    populateOptions: { path: string | any; select?: string | any, virtuals?: boolean | string[] } = {
      path: ".",
      select: ["-__v"],
      virtuals: false,
    }
  ): Promise<T | null> {
    Object.assign(projection, this.sentitiveInfo);
    try {
      return await this.Model.findById(id)
        .populate({ ...populateOptions })
        .select([...projection])
        .lean({ virtuals: populateOptions.virtuals });
    } catch (err) {
      if (err instanceof mongoose.Error.CastError) {
        return null;
      }
      throw err;
    }
  }
  public async create(user: any, payload: any): Promise<any> {
    await this.validate(null, payload);
    // try to set common const fields
    payload.createdAt = new Date();
    payload.createdBy = user && user.id;
    const entity = await this.Model.create(payload);
    return {
      id: entity.id,
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
      id: entity.id,
    };
  }
  public async delete(user: any, id: any): Promise<void> {
    const entity = await this.Model.findById(id).lean();
    if (!entity) throw "Entity not found";
    await this.Model.deleteOne({ _id: id });
  }
}
