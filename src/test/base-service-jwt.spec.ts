import * as ChaiAsPromised from "chai-as-promised";
import { expect, use } from "chai";

import BaseServiceToken from "../service/base-service-token";

use(ChaiAsPromised);

let service: ServiceDemo;

class ServiceDemo extends BaseServiceToken {
  signPayload() {
    // dont change the payload structure
    return this.signJwtToken({ name: "tests", id: "999" });
  }

  signUserToken() {
    // deprecated getJwtToken it change the payload to 'user'
    return this.getJwtToken({ name: "tests", id: "999" });
  }

  validateToken(token: string) {
    return this.validateJwtToken(token);
  }
}

describe("🚧  Testing JWT Service  🚧", () => {
  before(async () => {});
  after(async () => {});

  beforeEach(async () => {});

  afterEach(async () => {});

  describe("JWT environment configuration", async () => {
    it("JWT valid environment values", async () => {
      process.env.JWT_SECRET = "JWT_SECRET";
      process.env.JWT_ISSUER = "JWT_ISSUER";
      process.env.JWT_EXPIRE = "2h";

      service = new ServiceDemo();
      const result = service.validateEnvs();
      expect(result).to.equal(undefined);
    });

    it("JWT sign token", async () => {
      process.env.JWT_SECRET = "JWT_SECRET";
      process.env.JWT_ISSUER = "JWT_ISSUER";
      process.env.JWT_EXPIRE = "2h";

      service = new ServiceDemo();
      const signed = await service.signPayload();
      expect(signed).to.not.equal(undefined);
      expect(signed.includes("ey")).to.equal(true);
    });

    it("JWT validate token", async () => {
      process.env.JWT_SECRET = "JWT_SECRET";
      process.env.JWT_ISSUER = "JWT_ISSUER";
      process.env.JWT_EXPIRE = "2h";

      service = new ServiceDemo();
      const signed = await service.signPayload();
      const decoded: any = await service.validateToken(signed);
      expect(decoded.name).to.equal("tests");
      expect(decoded.id).to.equal("999");
    });

    it("JWT Sign user token", async () => {
      process.env.JWT_SECRET = "JWT_SECRET";
      process.env.JWT_ISSUER = "JWT_ISSUER";
      process.env.JWT_EXPIRE = "2h";

      service = new ServiceDemo();
      const userToken = await service.signUserToken();
      const decoded: any = await service.validateToken(userToken);
      expect(decoded.user.name).to.equal("tests");
      expect(decoded.user.id).to.equal("999");
    });

    it("JWT invalid environment values", async () => {
      process.env.JWT_SECRET = "";
      process.env.JWT_ISSUER = "";
      process.env.JWT_EXPIRE = "";

      service = new ServiceDemo();
      try {
        service.validateEnvs();
      } catch (error: any) {
        expect(
          error.message.includes("Environment missing or invalid")
        ).to.equal(true);
      }
    });
  });
});
