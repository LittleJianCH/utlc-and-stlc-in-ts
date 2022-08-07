import { Environment } from "./env";
import { multArgFunc, Type } from "./type";
import { Value } from "./value";
import { doApplyE } from "./doApply";
import { str, TypeError } from "./basic";

export function doRecE(env: Environment, type: Type, n: Value, start: Value, step: Value): Value {
  switch (n.tag) {
    case "VZero":
      return start;

    case "VSucc":
      return doApplyE(doApplyE(step, n), doRecE(env, type, n.val, start, step));

    case "VNeutral":
      return {
        tag: "VNeutral",
        type: type,
        val: {
          tag: "NRec",
          type: n.type,
          n: n.val,
          start: { val: start, type: type },
          step: { val: step, type: multArgFunc([{ tag: "TNat" }, type, type]) }
        }
      };
  }

  throw new TypeError(str(n) + " must be a natural number");
}