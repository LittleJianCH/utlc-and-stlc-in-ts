import { Value } from "./value";
import { Env, extendEnv } from "../env";
import { Name } from "../basic";
import { Lam, Expr } from "../expr"
import { freshen } from "../freshen";
import { VNeutral, NVar } from "./neutral";

export class VClosure extends Value {
  constructor(public env: Env, public name: Name, public expr: Expr) {
    super();
  }

  doApply(val: Value) {
    return this.expr.eval(extendEnv(this.env, this.name, val));
  }

  readBack(used: Name[]) {
    let x = freshen(this.name, used);
    let val = this.doApply(new VNeutral(new NVar(x)));
    
    return new Lam(x, val.readBack(used.concat([x])));
  }
}