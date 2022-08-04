import { Name, Message, readMessage } from "./basic";
import { Expr } from "./expr";
import { Type } from "./type";
import { Context, Environment, extend } from "./env";
import { synthE } from "./synth";
import { checkE } from "./check";
import { Value } from "./value";
import { evalE } from "./eval";

export function check(ctx: Context, expr: Expr, type: Type): Message | boolean {
  return readMessage(() => checkE(ctx, expr, type));
}

export function synth(ctx: Context, expr: Expr): Message | Type {
  return readMessage(() => synthE(ctx, expr));
}

export function runProgramOfType(defs: [Name, Expr][], expr: Expr): Type | Message {
  return readMessage(() => {
    let ctx = {};
    for (let [name, def] of defs) {
      ctx = extend(ctx, name, synthE(ctx, def));
    }
    return synthE(ctx, expr);
  });
}

export function evalExpr(env: Environment, expr: Expr): Message | Value {
  return readMessage(() => {
    let _ = synthE({}, expr);
    return evalE(env, expr);
  });
}