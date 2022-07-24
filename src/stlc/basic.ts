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

export function readMessage<T>(func: () => T): T | Message {
  try {
    return func();
  } catch(e) {
    if (e instanceof UndefinedVariableError || e instanceof TypeError) {
      return e.message;
    } else {
      throw e;
    }
  }
}