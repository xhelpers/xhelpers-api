import { expect } from "chai";
import BaseServiceSequelize from "../service/base-service-sequelize";
import * as st from "sequelize-typescript";
import { SinonStub, stub } from "sinon";

// Define a sample model for testing purposes
@st.Table({
  tableName: "tests",
})
class SampleModel extends st.Model<SampleModel> {
  @st.Column({
    defaultValue: st.DataType.UUIDV4,
    primaryKey: true,
    type: st.DataType.UUID,
  })
  id!: string;
  @st.Column
  name!: string;
  @st.Column
  createdAt!: Date;
  @st.Column
  updatedAt!: Date;

  // mocks
  findAll: SinonStub = stub().resolves([]);
  findByPk: SinonStub = stub().resolves(null);
  create: SinonStub = stub().resolves({ id: 1 });
  save: SinonStub = stub().resolves({ id: 1 });
  destroy: SinonStub = stub().resolves();
}

class RepoService extends BaseServiceSequelize<SampleModel> {
  protected sentitiveInfo: any[] = [];
  protected validate(entity: any, payload: SampleModel): Promise<Boolean> {
    return Promise.resolve(true);
  }
  constructor(model: any) {
    super(model);
  }
  getModel(): any {
    return this.Model;
  }

  protected getRepository(sequelizeModel: any): any {
    return sequelizeModel;
  }
}

describe("🚧  Testing Base Service BaseServiceSequelize", function () {
  describe("queryAll", () => {
    it("should call findAll method with correct parameters", async () => {
      var repositoryMock = {
        findAll: stub().returns(Promise.resolve([])),
        getAttributes(this: any): any {
          return Object.keys(SampleModel);
        },
      };
      var service = new RepoService(repositoryMock);
      const conditions = {
        attributes: ["id", "name"],
        limit: 10,
        offset: 1,
        order: [],
        where: { id: 1 },
      };
      await service.queryAll(null, {
        filter: { id: 1 },
        fields: "id,name",
      });
      expect(repositoryMock.findAll.calledOnce).to.be.true;
      expect(repositoryMock.findAll.firstCall.args[0]).to.deep.equal(
        conditions
      );
    });
    it("should call findAll method with null parameters", async () => {
      var repositoryMock = {
        findAll: stub().returns(Promise.resolve([])),
        getAttributes(this: any): any {
          return Object.keys(SampleModel);
        },
      };
      var service = new RepoService(repositoryMock);
      const conditions = {
        attributes: [],
        limit: 10,
        offset: 1,
        order: [],
        where: {},
      };
      await service.queryAll(null, {
        filter: null,
        fields: null,
      });
      expect(repositoryMock.findAll.calledOnce).to.be.true;
      expect(repositoryMock.findAll.firstCall.args[0]).to.deep.equal(
        conditions
      );
    });
  });

  describe("getById", function () {
    it("should call repository's findByPk method with correct id", async function () {
      var repositoryMock = {
        findByPk: stub().returns(Promise.resolve()),
      };
      var service = new RepoService(repositoryMock);
      await service.getById(null, "test-id");
      expect(repositoryMock.findByPk.calledOnce).to.be.true;
      expect(repositoryMock.findByPk.firstCall.args[0]).to.equal("test-id");
    });

    it("should return null when entity is not found", async () => {
      var repositoryMock = {
        findByPk: stub().returns(Promise.resolve(null)),
      };
      var service = new RepoService(repositoryMock);
      service.getById(null, 999);
      const result = await service.getById(null, 1);
      expect(result).to.be.null;
    });

    it("should return the entity when it is found", async () => {
      const model = { id: 999, name: "test" };
      var repositoryMock = {
        findByPk: stub().returns(Promise.resolve(model)),
      };
      var service = new RepoService(repositoryMock);
      const result = await service.getById(null, 1);
      expect(result).to.deep.equal(model);
    });
  });

  describe("create", () => {
    it("should call create method with correct parameters", async () => {
      var repositoryMock = {
        create: stub().returns(Promise.resolve({ id: 666 })),
      };
      var service = new RepoService(repositoryMock);
      const payload = { name: "New Entity" };
      await service.create(null, payload);
      expect(repositoryMock.create.calledOnce).to.be.true;
      expect(repositoryMock.create.firstCall.args[0]).to.deep.equal(payload);
    });

    it("should set createdAt and createdBy fields in the payload", async () => {
      var repositoryMock = {
        create: stub().returns(Promise.resolve({ id: 666 })),
      };
      var service = new RepoService(repositoryMock);
      const payload = { name: "New Entity" };
      await service.create({ id: 1 }, payload);
      const createdAt = repositoryMock.create.firstCall.args[0].createdAt;
      const createdBy = repositoryMock.create.firstCall.args[0].createdBy;
      expect(createdAt).to.be.an.instanceOf(Date);
      expect(createdBy).to.equal(1);
    });

    it("should return the created entity ID", async () => {
      var repositoryMock = {
        create: stub().returns(Promise.resolve({ id: 1 })),
      };
      var service = new RepoService(repositoryMock);
      const payload = { name: "New Entity" };
      const result = await service.create({ id: 1 }, payload);
      expect(result).to.deep.equal({ id: 1 });
    });
  });

  describe("update", () => {
    it("should call findByPk and save methods with correct parameters", async () => {
      const model = { id: 999, name: "test" };
      const entityModel = {
        ...model,
        save: stub().returns(Promise.resolve()),
      };
      var repositoryMock = {
        findByPk: stub().returns(Promise.resolve(entityModel)),
        update: stub().returns(Promise.resolve({ id: 1 })),
      };
      var service = new RepoService(repositoryMock);

      const payload: any = { name: "Updated Entity" };
      await service.update(null, 1, payload);
      expect(repositoryMock.findByPk.calledOnce).to.be.true;
      expect(repositoryMock.findByPk.firstCall.args[0]).to.equal(1);
      expect(entityModel.save.calledOnce).to.be.true;
    });

    it("should throw an error when entity is not found", async () => {
      var repositoryMock = {
        findByPk: stub().returns(Promise.resolve(null)),
        update: stub().returns(Promise.resolve({ id: 1 })),
      };
      var service = new RepoService(repositoryMock);
      const payload: any = { name: "Updated Entity" };
      try {
        await service.update(null, 1, payload);
        throw new Error("Test should have thrown an error");
      } catch (error: any) {
        expect(error.message).to.equal("Entity not found");
      }
    });

    it("should set updatedAt and updatedBy fields in the entity", async () => {
      const entityModel = {
        id: 1,
        name: "Existing Entity",
        updatedAt: null,
        updatedBy: 1,
        save: stub().returns(Promise.resolve(true)),
      };
      var repositoryMock = {
        findByPk: stub().returns(Promise.resolve(entityModel)),
      };
      var service = new RepoService(repositoryMock);
      const payload: any = { name: "Updated Entity" };
      await service.update({ id: 2 }, 1, payload);
      expect(repositoryMock.findByPk.calledOnce).to.be.true;
      expect(repositoryMock.findByPk.firstCall.args[0]).to.equal(1);
    });
  });

  describe("delete", () => {
    it("should delete the entity when it is found", async () => {
      const model = {
        id: 1,
        name: "Existing Entity",
        updatedAt: null,
        updatedBy: 1,
        destroy: stub(),
      };
      var repositoryMock = {
        findByPk: stub().returns(Promise.resolve(model)),
      };
      var service = new RepoService(repositoryMock);
      await service.delete(null, 1);
      expect(model.destroy.calledOnce).to.be.true;
    });

    it("should throw an error when entity is not found", async () => {
      var repositoryMock = {
        findByPk: stub().returns(Promise.resolve(null)),
      };
      var service = new RepoService(repositoryMock);
      try {
        await service.delete(null, 1);
        throw new Error("Test should have thrown an error");
      } catch (error: any) {
        expect(error.message).to.equal("Entity not found");
      }
    });
  });
});
