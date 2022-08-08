import { Value } from "./value";
import { str } from "./basic";

export function doCdrE(vPair: Value): Value {
  switch (vPair.tag) {
    case "VPair":
      return vPair.cdr;

    case "VNeutral":
      if (vPair.type.tag == "TPair") {
        return {
          tag: "VNeutral",
          type: vPair.type.cdr,
          val: {
            tag: "NCdr",
            arg: vPair.val
          }
        };
      }
  }

  throw new TypeError(str(vPair) + " is not a pair");
}