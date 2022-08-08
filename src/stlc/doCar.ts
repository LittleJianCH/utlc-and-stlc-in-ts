import { Value } from "./value";
import { str } from "./basic";

export function doCarE(vPair: Value): Value {
  switch (vPair.tag) {
    case "VPair":
      return vPair.car;

    case "VNeutral":
      if (vPair.type.tag == "TPair") {
        return {
          tag: "VNeutral",
          type: vPair.type.car,
          val: {
            tag: "NCar",
            arg: vPair.val
          }
        };
      }
  }

  throw new TypeError(str(vPair) + " is not a pair");
}