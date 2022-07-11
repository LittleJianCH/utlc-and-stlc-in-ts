export module Utlc {
  export type Name = string;
  export type Message = string;

  export type Env = {
    [key: Name]: Value;
  }

  class UndefinedVariableError extends Error {
    constructor(name: Name) {
      super(`Undefined variable ${name}`);
    }
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
    abstract doApply(val: Value): Value;
    abstract readBack(used: Name[]): Expr;
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
      
      return new Lam(x, val.readBack(used.concat([x])));
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
    abstract readBack(used: Name[]): Expr;
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

      return new App(fun, arg);
    }
  }

  export abstract class Expr {
    abstract eval(env: Env): Value;
    normalize(): Expr {
      return this.eval({}).readBack([]);
    }
  }

  export class Var extends Expr {
    constructor(public name: Name) {
      super();
    }

    eval(env: Env) {
      let res = env[this.name];
      if (res == undefined) {
        throw new UndefinedVariableError(this.name);
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

      return fun.doApply(arg);
    }
  }

  function readMessage<T>(func: () => T): T | Message {
    try {
      return func();
    } catch (e) {
      if (e instanceof UndefinedVariableError) {
        return e.message;
      } else {
        throw e;
      }
    }
  }

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
}