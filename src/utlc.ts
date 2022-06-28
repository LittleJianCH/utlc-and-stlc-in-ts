export module Utlc {
  export type Name = string;
  export type Message = string;

  export type Env = {
    [key: Name]: Value;
  }

  function extendEnv(env: Env, name: Name, value: Value): Env {
    return {
      ...env,
      [name]: value
    };
  }

  function freshen(name: Name, used: Name[]): Name {
    if (used.includes(name)) {
      return freshen(name + "'", used);
    } else {
      return name;
    }
  }

  export abstract class Value {
    abstract doApply(val: Value): Value | Message;
    abstract readBack(used: Name[]): Expr | Message;
  }

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
      
      if (typeof val === 'string') {
        return val;
      } else {
        let expr = val.readBack(used);
        if (typeof expr === 'string') {
          return expr;
        } else {
          return new Lam(x, expr);
        }
      }
    }
  }

  export class VNeutral extends Value {
    constructor(public neutral: Neutral) {
      super();
    }

    doApply(val: Value) {
      return new VNeutral(new NApp(this.neutral, val));
    }

    readBack(used: Name[]) {
      return this.neutral.readBack(used);
    }
  }

  export abstract class Neutral {
    abstract readBack(used: Name[]): Expr | Message;
  }

  export class NVar extends Neutral {
    constructor(public name: Name) {
      super();
    }
    
    readBack(used: Name[]) {
      return new Var(this.name); // this.name is impossible to be used here
    }
  }

  export class NApp extends Neutral {
    constructor(public fun: Neutral, public arg: Value) {
      super();
    }

    readBack(used: string[]) {
      let fun = new VNeutral(this.fun).readBack(used);
      let arg = this.arg.readBack(used);

      if (typeof fun === 'string') {
        return fun;
      } else if(typeof arg === 'string') {
        return arg;
      } else {
        return new App(fun, arg);
      }
    }
  }

  export abstract class Expr {
    abstract eval(env: Env): Value | Message;
    normalize(): Expr | Message {
      let val = this.eval({});

      if (typeof val === 'string') {
        return val;
      } else {
        return val.readBack([]);
      }
    }
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
      return new VClosure(env, this.name, this.expr);
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
        return fun.doApply(arg);
      }
    }
  }

  export function evalExpr(expr: Expr, env: Env): Value | Message {
    return expr.eval(env);
  }

  export function normalize(expr: Expr): Expr | Message {
    return expr.normalize();
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