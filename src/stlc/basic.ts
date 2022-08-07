import { Type } from "./type";
import { Expr } from "./expr";

export let str = JSON.stringify;

export type Name = string;
export type Message = string;

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

export function unmatchedType(expr: Expr, type: Type): TypeError {
  return new TypeError(`Cannot match ${str(expr)} against ${str(type)}`);
}

export class HoleInformation extends Error {
  constructor(id: number, type: Type) {
    super(`Hole ${id}'s type should be ${str(type)}`);
  }
}

export function readMessage<T>(func: () => T): T | Message {
  try {
    return func();
  } catch(e) {
    if (e instanceof HoleInformation
      || e instanceof TypeError
      || e instanceof UndefinedVariableError) {
      return e.message;
    } else {
      throw e;
    }
  }
}