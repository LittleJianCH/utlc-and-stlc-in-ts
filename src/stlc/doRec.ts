import { Environment } from "./env";
import { Type } from "./type";
import { Value } from "./value";
import { doApplyE } from "./doApply";
import { str, TypeError } from "./basic";

export function doRecE(env: Environment, type: Type, n: Value, start: Value, iter: Value): Value {
  switch (n.tag) {
    case "VZero":
      return start;

    case "VSucc":
      let newStart = doApplyE(iter, start);
      return doRecE(env, type, n.val, newStart, iter);

    case "VNeutral":
      return {
        tag: "VNeutral",
        type: type,
        val: {
          tag: "NRec",
          type: n.type,
          n: n.val,
          start: { val: start, type: type },
          iter: { val: iter, type: { tag: "TArr", arg: type, res: type } }
        }
      };
  }

  throw new TypeError(str(n) + " must be a natural number");
}