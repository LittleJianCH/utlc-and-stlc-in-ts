import { Expr } from "./expr";
import { Name, UndefinedVariableError } from "../basic";
import { Env } from "../env";

export class Var extends Expr {
  constructor(public name: Name) {
    super();
  }

  eval(env: Env) {
    let res = env[this.name];
    if (res == undefined) {
      throw new UndefinedVariableError(this.name);
    } else {
      return res;
    }
  }
}