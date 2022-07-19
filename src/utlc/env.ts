import { Name } from "./basic";
import { Value } from "./value";

export type Env = {
  [key: Name]: Value;
}

export function extendEnv(env: Env, name: Name, value: Value): Env {
  return {
    ...env,
    [name]: value
  };
}