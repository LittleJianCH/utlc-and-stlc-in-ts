export module Utlc {
  export type Name = string;
  export type Message = string;

  export type Value = {
    // Closure
    env: Env;
    name: Name;
    expr: Expr;
  }

  export type Env = {
    [key: Name]: Value;
  }

  function extendEnv(env: Env, name: Name, value: Value): Env {
    return {
      ...env,
      [name]: value
    };
  }

  export abstract class Expr {
    abstract eval(env: Env): Value | Message;
  }

  export class Var extends Expr {
    constructor(public name: Name) {
      super();
    }

    eval(env: Env) {
      let res = env[this.name];
      if (res == undefined) {
        return `Undefined variable ${this.name}`;
      } else {
        return res;
      }
    }
  }

  export class Lam extends Expr {
    constructor(public name: Name, public expr: Expr) {
      super();
    }

    eval(env: Env) {
      return {
        env: env,
        name: this.name,
        expr: this.expr
      };
    }
  }

  export class App extends Expr {
    constructor(public fun: Expr, public arg: Expr) {
      super();
    }

    eval(env: Env) {
      let fun = this.fun.eval(env);
      let arg = this.arg.eval(env);

      if (typeof fun === 'string') {
        return fun;
      } else if (typeof arg === 'string') {
        return arg;
      } else {
        return fun.expr.eval(extendEnv(fun.env, fun.name, arg));
      }
    }
  }

  export function evalExpr(expr: Expr, env: Env): Value | Message {
    return expr.eval(env);
  }

  export function runProgram(defs: [Name, Expr][], expr: Expr): Value | Message {
    let env = {};

    for (let [name, expr] of defs) {
      let result = expr.eval(env);
      if (typeof result === 'string') {
        return result;
      } else {
        env = extendEnv(env, name, result);
      }
    }

    return expr.eval(env);
  }
}