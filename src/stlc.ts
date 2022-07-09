export module Stlc {
  // I have made Utlc in OOP style(abstract class + inheritance).
  // So I want to try to make Stlc in FP style(tagged union + pattern match)

  let str = JSON.stringify;

  export type Name = string;
  export type Message = string;
  export type Context = {
    [key: Name]: Type
  };

  export class UndefinedVariableError extends Error {
    constructor(name: Name) {
      super(`Undefined variable ${name}`);
    }
  }

  export class TypeError extends Error {
    constructor(message: string) {
      super(message);
    }
  }

  function extendCtx(ctx: Context, name: Name, type: Type): Context {
    return {
      ...ctx,
      [name]: type
    };
  }

  export type Expr = { tag: 'Var'; name: Name }
                   | { tag: 'Lam'; name: Name; expr: Expr }
                   | { tag: 'App'; fun: Expr; arg: Expr }
                   | { tag: 'Zero' }
                   | { tag: 'Succ'; arg: Expr }
                   | { tag: 'Rec'; type: Type; n: Expr; b: Expr;  s : Expr } // rec[t] n b s
                   | { tag: 'Ann'; expr: Expr; type: Type }; // expr \in type
  
  export type Type = { tag: 'TNat' }
                   | { tag: 'TArr'; arg: Type; res: Type }; // arg -> res
  
  function synthE(ctx: Context, expr: Expr): Type {
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
        let nT = synthE(ctx, expr.n);
        if (nT.tag === 'TNat') {
          checkE(ctx, expr.b, expr.type);
          checkE(ctx, expr.s, { tag: 'TArr', arg: expr.type, res: expr.type });
          return expr.type; 
        } else {
          throw new TypeError(`Not a nat type: ${str(nT)}`);
        }
      
      case 'Zero':
        return { tag: 'TNat' };
      
      case 'Succ':
        checkE(ctx, expr.arg, { tag: 'TNat' });
        return { tag: 'TNat' };

      case 'Ann':
        checkE(ctx, expr.expr, expr.type);
        return expr.type;

      default:
        throw new TypeError(`Cannot find a type for ${str(expr)}, Please add a type annotation`);
    }
  }

  function checkE(ctx: Context, expr: Expr, type: Type): boolean {
    // If it's impossible to check expr against type, throw an error
    // else return `true`

    let unmatched = (expr: Expr, type: Type) => {
      throw new TypeError(`Cannot match ${str(expr)} against ${str(type)}`);
    }

    switch (expr.tag) {
      case 'Lam': 
        if (type.tag === 'TArr') {
          checkE(extendCtx(ctx, expr.name, type.arg), expr.expr, type.res);
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

  function readMessage<T>(func: () => T): T | Message {
    try {
      return func();
    } catch(e) {
      if (e instanceof UndefinedVariableError || e instanceof TypeError) {
        return e.message;
      } else {
        throw e;
      }
    }
  }

  export function synth(ctx: Context, expr: Expr) {
    return readMessage(() => synthE(ctx, expr));
  }

  export function check(ctx: Context, expr: Expr, type: Type) {
    return readMessage(() => checkE(ctx, expr, type));
  };
}