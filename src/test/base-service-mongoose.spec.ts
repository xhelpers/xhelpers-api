import * as ChaiAsPromised from "chai-as-promised";
import Service from "./base-service-mongoose/service";
import TodoModel from "./base-service-mongoose/model";
import { expect, use } from "chai";
import mongoose from "../mongoose";

use(ChaiAsPromised);

describe("🚧  Testing Base Service Mongoose  🚧", () => {
  before(async () => {
    
    await mongoose.connect(process.env.MONGODB_URI || "", {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    return Promise.resolve();
  });

  after(async () => {
    return Promise.resolve();
  });

  beforeEach(async () => {
    await mongoose.connections[0].db.dropDatabase();
  });
  afterEach(async () => {});

  describe("Mongoose queryAll", async () => {
    it("should return all", async () => {
      const service = new Service();
      const user = {
        id: "123"
      };
      const payload = {
        task: "test",
        description: "test",
        done: true
      };
      await service.create(user, payload);

      const todos = await service.queryAll(user);
      expect(todos.results.length).to.equal(1);
    });
  });

  describe("Mongoose queryAll", async () => {
    it("should return all", async () => {
      const service = new Service();
      const user = {
        id: "123"
      };
      const payload = {
        task: "test",
        description: "test",
        done: true
      };
      const entity = await service.create(user, payload);

      const todo = await service.getById(user, entity.id);
      expect(todo?.task).to.equal(payload.task);
      expect(todo?.description).to.equal(payload.description);
      expect(todo?.done).to.equal(payload.done);
    });
  });

  describe("Mongoose create", async () => {

    it("should create and set createdBy", async () => {
      const service = new Service();
      const user = {
        id: "123"
      };
      const payload = {
        task: "test",
        description: "test",
        done: true
      };
      const entity = await service.create(user, payload);
      const todo = await TodoModel.findById(entity.id);
      expect(todo).not.to.equal(null);
      expect(todo?.createdAt).not.to.equal(null);
      expect(todo?.createdBy).to.equal(user.id);
      expect(todo?.updatedAt).to.equal(undefined);
      expect(todo?.updatedBy).to.equal(undefined);
      expect(todo?.task).to.equal(payload.task);
      expect(todo?.description).to.equal(payload.description);
      expect(todo?.done).to.equal(payload.done);

      return Promise.resolve();
    });

    it("should fail validate", async () => {
      const service = new Service();
      const user = {
        id: "123"
      };
      const payload = {
        description: "forbidden description",
        task: "test",
        done: true
      };
      try {
        await service.create(user, payload);
      } catch {}
      const todos = await TodoModel.find({});
      expect(todos.length).to.equal(0);

      return Promise.resolve();
    });
  });
  describe("Mongoose update", async () => {
    it("should update", async () => {
      const service = new Service();
      const user = {
        id: "123"
      };
      const payload = {
        task: "test",
        description: "test",
        done: true
      };
      let entity;
      entity = await service.create(user, payload);
      const updatedPayload = {
        ...payload,
        description: "test2"
      }
      entity = await service.update(user, entity.id, updatedPayload as any);
      const todo = await TodoModel.findById(entity.id);

      expect(todo).not.to.equal(null);
      expect(todo?.createdAt).not.to.equal(null);
      expect(todo?.createdBy).to.equal(user.id);
      expect(todo?.updatedAt).not.to.equal(null);
      expect(todo?.updatedBy).to.equal(user.id);
      expect(todo?.task).to.equal(updatedPayload.task);
      expect(todo?.description).to.equal(updatedPayload.description);
      expect(todo?.done).to.equal(updatedPayload.done);
    });

    it("should fail validate", async () => {
      const service = new Service();
      const user = {
        id: "123"
      };
      const payload = {
        task: "test",
        description: "test",
        done: true
      };
      let entity;
      entity = await service.create(user, payload);
      const updatedPayload = {
        ...payload,
        task: "test2"
      }
      try {
        await service.update(user, entity.id, updatedPayload as any);
      } catch {}
      const todo = await TodoModel.findById(entity.id);

      expect(todo).not.to.equal(null);
      expect(todo?.createdAt).not.to.equal(null);
      expect(todo?.createdBy).to.equal(user.id);
      expect(todo?.updatedAt).not.to.equal(null);
      expect(todo?.updatedBy).to.equal(undefined);
      expect(todo?.task).to.equal(payload.task);
      expect(todo?.description).to.equal(payload.description);
      expect(todo?.done).to.equal(payload.done);
    });

    it("should fail not found", async () => {
      const service = new Service();
      const user = {
        id: "123"
      };
      const payload = {
        task: "test",
        description: "test",
        done: true
      };
      let entity = null;
      try {
        entity = await service.update(user, "123", payload as any);
      } catch {}
      expect(entity).to.be.null;
    })
  });

  describe("Mongoose delete", async () => {
    it("should delete", async () => {
      const service = new Service();
      const user = {
        id: "123"
      };
      const payload = {
        task: "test",
        description: "test",
        done: true
      };
      let entity = null;
      entity = await service.create(user, payload);
      let todos = await TodoModel.find({});
      expect(todos.length).to.equal(1);

      try {
        entity = await service.delete(user, entity.id);
      } catch {}

      todos = await TodoModel.find({});
      expect(todos.length).to.equal(0);
    });

    it("should fail not found", async () => {
      const service = new Service();
      const user = {
        id: "123"
      };
      let entity = null;
      try {
        entity = await service.delete(user, "123");
      } catch {}

      expect(entity).to.be.null;
    })
  });
});
