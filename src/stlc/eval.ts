import { UndefinedVariableError } from "./basic";
import { Expr } from "./expr";
import { Value } from "./value";
import { Environment } from "./env";
import { doApplyE } from "./doApply";
import { doRecE } from "./doRec";

export function evalE(env: Environment, expr: Expr): Value {
  switch (expr.tag) {
    case "Var":
      let res = env[expr.name];
      if (res === undefined) {
        throw new UndefinedVariableError(expr.name);
      }
      return res;

    case "Lam":
      return { tag: "VClosure", name: expr.name, expr: expr.expr, env: env };

    case "App":
      let vFun = evalE(env, expr.fun);
      let vArg = evalE(env, expr.arg);

      return doApplyE(vFun, vArg);

    case "Zero":
      return { tag: "VZero" };

    case "Succ":
      return { tag: "VSucc", val: evalE(env, expr.arg) };

    case "Rec":
      let n = evalE(env, expr.n);
      let start = evalE(env, expr.start);
      let iter = evalE(env, expr.iter);

      return doRecE(env, expr.type, n, start, iter);

    case "Ann":
      return evalE(env, expr.expr);
  }
}