import { Expr } from "./expr";
import { Env } from "../env";

export class App extends Expr {
  constructor(public fun: Expr, public arg: Expr) {
    super();
  }

  eval(env: Env) {
    let fun = this.fun.eval(env);
    let arg = this.arg.eval(env);

    return fun.doApply(arg);
  }
}