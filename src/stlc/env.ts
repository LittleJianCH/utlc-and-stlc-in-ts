import { Name } from "./basic";
import { Type } from "./type";
import { Value } from "./value";

type Env<T> = { [name: string]: T };

export type Context = Env<Type>;
export type Environment = Env<Value>;

export function extend<T>(ctx: Env<T>, name: Name, val: T): Env<T> {
  return {
    ...ctx,
    [name]: val
  };
}