export type Name = string;
export type Message = string;

export class UndefinedVariableError extends Error {
    constructor(name: Name) {
        super(`Undefined variable ${name}`);
    }
}

export function readMessage<T>(func: () => T): T | Message {
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