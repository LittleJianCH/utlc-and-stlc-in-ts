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
      } else {
        throw unmatchedType(expr, type);
      }
      return true;

    case 'Hole':
      throw new HoleInformation(expr.id, type);
    
    default:
      if (str(synthE(ctx, expr)) != str(type)) {
        throw unmatchedType(expr, type);
      }
      return true;
  }
}
