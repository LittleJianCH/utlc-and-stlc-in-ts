import { HoleInformation, str, unmatchedType } from "./basic";
import { Context, extend } from "./env";
import { Expr } from "./expr";
import { Type } from "./type";
import { synthE } from "./synth";

export function checkE(ctx: Context, expr: Expr, type: Type): boolean {
  // If it's impossible to check expr against type, throw an error
  // else return `true`

  switch (expr.tag) {
    case 'Lam': 
      if (type.tag === 'TArr') {
        checkE(extend(ctx, expr.name, type.arg), expr.expr, type.res);
        return true;
      } else {
        throw unmatchedType(expr, type);
      }

    case 'Cons':
      if (type.tag === 'TPair') {
        checkE(ctx, expr.car, type.car);
        checkE(ctx, expr.cdr, type.cdr);
        return true;
      } else {
        throw unmatchedType(expr, type);
      }

    case 'Hole':
      throw new HoleInformation(expr.id, type);
    
    default:
      if (str(synthE(ctx, expr)) != str(type)) {
        throw unmatchedType(expr, type);
      }
      return true;
  }
}
