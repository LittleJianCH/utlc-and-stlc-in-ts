import { str } from "./basic";
import { Value } from "./value";
import { evalE } from "./eval";
import { extend } from "./env";
import { TypeError } from "./basic";

export function doApplyE(fun: Value, arg: Value): Value {
  switch (fun.tag) {
    case "VClosure":
      return evalE(extend(fun.env, fun.name, arg), fun.expr);

    case "VNeutral":
      if (fun.type.tag == 'TArr') {
        let tRes = fun.type.res;
        let tArg = fun.type.arg;

        return {
          tag: "VNeutral",
          type: tRes,
          val: {
            tag: 'NApp',
            fun: fun.val,
            arg: { type: tArg, val: arg }
          }
        };
      }
  }

  throw new TypeError(str(fun) + " is unable to be applied");
}