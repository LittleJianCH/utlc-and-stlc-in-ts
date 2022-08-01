import { str, TypeError } from "./basic";
import { Context, extend } from "./env";
import { Expr } from "./expr";
import { Type } from "./type";
import { synthE } from "./synth";

export function checkE(ctx: Context, expr: Expr, type: Type): boolean {
  // If it's impossible to check expr against type, throw an error
  // else return `true`

  let unmatched = (expr: Expr, type: Type) => {
    throw new TypeError(`Cannot match ${str(expr)} against ${str(type)}`);
  }

  switch (expr.tag) {
    case 'Lam': 
      if (type.tag === 'TArr') {
        checkE(extend(ctx, expr.name, type.arg), expr.expr, type.res);
      } else {
        unmatched(expr, type);
      }
      return true;
    
    default:
      if (str(synthE(ctx, expr)) != str(type)) {
        unmatched(expr, type);
      }
      return true;
  }
}
