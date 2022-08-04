import { Name, Message, readMessage } from "./basic";
import { Expr } from "./expr";
import { Type } from "./type";
import { Context, Environment, extend } from "./env";
import { synthE } from "./synth";
import { checkE } from "./check";
import { Value } from "./value";
import { evalE } from "./eval";
import { readBack } from "./readBack";
import { alphaEquiv } from "./alphaEquiv";

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

export function evalExpr(expr: Expr): Message | Value {
  // If we want to run the expr in the environment,
  // we also have to give the context for the type checking.
  return readMessage(() => {
    let _ = synthE({}, expr);
    return evalE({}, expr);
  });
}

function normalizeE(expr: Expr): Expr {
  let type = synthE({}, expr);
  let val = evalE({}, expr);

  return readBack([], type, val);
}

export function normalize(expr: Expr): Message | Expr {
  return readMessage(() => normalizeE(expr));
}

export function exprEqual(expr1: Expr, expr2: Expr): Message | boolean {
  return readMessage(() => alphaEquiv(normalizeE(expr1), normalizeE(expr2), []));
}