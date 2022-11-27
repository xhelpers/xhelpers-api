import { jwt } from "../tools";

export default abstract class BaseServiceToken {
  issuer: string;

  secret: string;

  expire: string;

  constructor() {
    this.issuer = process.env.JWT_ISSUER || "";
    this.secret = process.env.JWT_SECRET || "";
    this.expire = process.env.JWT_EXPIRE || "";
  }

  validateEnvs() {
    if (!this.issuer || !this.secret || !this.expire) {
      throw Error(
        "Environment missing or invalid - JWT_ISSUER,JWT_SECRET,JWT_EXPIRE"
      );
    }
  }

  protected async signJwtToken(payload: any) {
    this.validateEnvs();
    const options = {
      issuer: this.issuer,
      expiresIn: this.expire,
    };
    return jwt.sign(payload, this.secret, options);
  }

  protected async validateJwtToken(token: string) {
    this.validateEnvs();
    const options = {
      issuer: this.issuer,
      expiresIn: this.expire,
    };
    return jwt.verify(token, this.secret, options);
  }

  /**
   * @deprecated you should use 'signJwtToken' instead
   */
  protected async getJwtToken(user: any) {
    this.validateEnvs();
    const options = {
      issuer: this.issuer,
      expiresIn: this.expire,
    };
    return jwt.sign(
      {
        user,
      },
      this.secret,
      options
    );
  }
}
