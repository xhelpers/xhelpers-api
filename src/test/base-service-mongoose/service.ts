import Todo, { ITodo } from "./model"; // mongoose or sequelize "Model"
import BaseServiceMongoose from "../../base-service-mongoose";
import * as Boom from "@hapi/boom";

// mongoose
export default class Service extends BaseServiceMongoose<ITodo> {
  protected sentitiveInfo: any = ["-__v"];
  constructor() {
    super(Todo);
  }
  protected async validate(entity: ITodo, payload: ITodo): Promise<boolean> {
    if (payload.description === "forbidden description") throw Boom.badRequest("invalid description");
    if (entity && entity.task !== payload.task) throw Boom.badRequest("task cannot be updated");
    const invalid = false;
    if (invalid) throw new Error("Invalid payload.");
    return Promise.resolve(true);
  };
}
