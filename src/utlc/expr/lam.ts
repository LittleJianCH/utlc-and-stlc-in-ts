import { Expr } from "./expr";
import { Name } from "../basic";
import { Env } from "../env";
import { VClosure } from "../value"

export class Lam extends Expr {
  constructor(public name: Name, public expr: Expr) {
    super();
  }

  eval(env: Env) {
    return new VClosure(env, this.name, this.expr);
  }
}