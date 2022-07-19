import { Env } from "../env";
import { Value } from "../value";

export abstract class Expr {
  abstract eval(env: Env): Value;
  normalize(): Expr {
    return this.eval({}).readBack([]);
  }
}
