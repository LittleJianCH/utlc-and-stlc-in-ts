import { Expr, Var, Lam, App } from "./expr";
import { Value } from "./value";
import { Env, extendEnv } from "./env";
import { readMessage, Message, Name } from "./basic";

export function evalExpr(expr: Expr, env: Env): Value | Message {
  return readMessage(() => expr.eval(env));
}

export function normalize(expr: Expr): Expr | Message {
  return readMessage(() => expr.normalize());
}

export function runProgram(defs: [Name, Expr][], expr: Expr): Value | Message {
  return readMessage(() => {
    let env = {};
    for (let [name, expr] of defs) {
      let val = expr.eval(env);
      env = extendEnv(env, name, val);
    }
    return expr.eval(env);
  });
}

function alphaEquiv(a: Expr, b: Expr, namePairs: string[]): boolean {
  if (a instanceof Var && b instanceof Var) {
    return namePairs.includes(JSON.stringify([a.name, b.name]));
  } else if (a instanceof Lam && b instanceof Lam) {
    return alphaEquiv(a.expr, b.expr, namePairs.concat([JSON.stringify([a.name, b.name])]));
  } else if (a instanceof App && b instanceof App) {
    return alphaEquiv(a.arg, b.arg, namePairs) &&
           alphaEquiv(a.fun, b.fun, namePairs);
  } else {
    return false;
  }
}

export function exprEqual(a: Expr, b: Expr): boolean | Message {
  // normalizing has done the beta-reduction, then adding the alpha-equivalence
  // is enough to check if two expressions are equivalent
  return readMessage(() => {
    return alphaEquiv(a.normalize(), b.normalize(), []);
  });
}