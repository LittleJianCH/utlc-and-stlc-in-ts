import { TypeError, UndefinedVariableError } from "./basic";
import { Expr } from "./expr";
import { Value } from "./value";
import { Environment } from "./env";
import { doApplyE } from "./doApply";
import { doRecE } from "./doRec";
import { doCarE } from "./doCar";
import { doCdrE } from "./doCdr";

export function evalE(env: Environment, expr: Expr): Value {
  switch (expr.tag) {
    case "Var":
      let res = env[expr.name];
      if (res === undefined) {
        // this part of the code is unreached
        // as we will check the type of expr before evaluating it
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
      let step = evalE(env, expr.step);

      return doRecE(env, expr.type, n, start, step);

    case "Cons":
      return { tag: "VPair", car: evalE(env, expr.car), cdr: evalE(env, expr.cdr) };

    case "Car":
      let vPair1 = evalE(env, expr.arg);
      return doCarE(vPair1);

    case "Cdr":
      let vPair2 = evalE(env, expr.arg);
      return doCdrE(vPair2);

    case "Ann":
      return evalE(env, expr.expr);

    case 'Hole':
      // This will also be unreached as we will check the type before
      throw new TypeError('Cannot evaluate an expression with hole');
  }
}