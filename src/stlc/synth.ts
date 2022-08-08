import { UndefinedVariableError, TypeError, str } from "./basic";
import { Expr } from "./expr";
import { multArgFunc, Type } from "./type";
import { checkE } from "./check";
import { Context } from "./env";

export function synthE(ctx: Context, expr: Expr): Type {
  switch (expr.tag) {
    case 'Var':
      let res = ctx[expr.name];
      if (res == undefined) {
        throw new UndefinedVariableError(expr.name);
      } else {
        return res;
      }

    case 'App':
      let fun = synthE(ctx, expr.fun);
      if (fun.tag === 'TArr') {
        checkE(ctx, expr.arg, fun.arg);
        return fun.res;
      } else {
        throw new TypeError(`Not a function type: ${str(fun)}`);
      }

    case 'Rec':
      let natT: Type = { tag: 'TNat' };
      checkE(ctx, expr.n, natT);
      checkE(ctx, expr.start, expr.type);
      checkE(ctx, expr.step, multArgFunc([natT, expr.type, expr.type]));
      return expr.type;
    
    case 'Zero':
      return { tag: 'TNat' };
    
    case 'Succ':
      checkE(ctx, expr.arg, { tag: 'TNat' });
      return { tag: 'TNat' };

    case 'Cons':
      let carT = synthE(ctx, expr.car);
      let cdrT = synthE(ctx, expr.cdr);
      return { tag: 'TPair', car: carT, cdr: cdrT };

    case 'Car':
      let pairT1 = synthE(ctx, expr.arg);
      if (pairT1.tag === 'TPair') {
        return pairT1.car;
      }
      throw new TypeError(`Not a pair type: ${str(pairT1)}`);

    case 'Cdr':
      let pairT2 = synthE(ctx, expr.arg);
      if (pairT2.tag === 'TPair') {
        return pairT2.cdr;
      }
      throw new TypeError(`Not a pair type: ${str(pairT2)}`);

    case 'Ann':
      checkE(ctx, expr.expr, expr.type);
      return expr.type;

    default:
      throw new TypeError(`Cannot find a type for ${str(expr)}, Please add a type annotation`);
  }
}