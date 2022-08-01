import { Name, Message, readMessage } from "./basic";
import { Expr } from "./expr";
import { Type } from "./type";
import { Context, extend } from "./env";
import { synthE } from "./synth";
import { checkE } from "./check";

export function check(ctx: Context, expr: Expr, type: Type): Message | boolean {
  return readMessage(() => checkE(ctx, expr, type));
}

export function synth(ctx: Context, expr: Expr): Message | Type {
  return readMessage(() => synthE(ctx, expr));
}

export function runProgram(defs: [Name, Expr][], expr: Expr): Type | Message {
  return readMessage(() => {
    let ctx = {};
    for (let [name, def] of defs) {
      ctx = extend(ctx, name, synthE(ctx, def));
    }
    return synthE(ctx, expr);
  });
}