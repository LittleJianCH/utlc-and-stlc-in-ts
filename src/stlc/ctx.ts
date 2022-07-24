import { Name } from "./basic";
import { Type } from "./type";

export type Context = {
  [key: Name]: Type
};

export function extendCtx(ctx: Context, name: Name, type: Type): Context {
  return {
    ...ctx,
    [name]: type
  };
}