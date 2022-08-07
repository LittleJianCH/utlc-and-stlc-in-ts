import { Name, str } from "./basic";
import { Normal, Value } from "./value";
import { Expr } from "./expr";
import { Type } from "./type";
import { freshen } from "./freshen";
import { doApplyE } from "./doApply";
import { Neutral } from "./neutral";

export function readBack(used: Name[], type: Type, val: Value): Expr {
  switch (type.tag) {
    case 'TNat':
      switch (val.tag) {
        case 'VZero': return { tag: 'Zero' };
        case 'VSucc': return { tag: 'Succ', arg: readBack(used, type, val.val) };
        case 'VNeutral':
          if (str(val.type) == str(type)) {
            return readBackNeutral(used, val.val);
          }
      }

      throw new Error(`Cannot read back ${str(val)} as Nat`);

    case 'TArr':
      let argName = undefined;

      switch (val.tag) {
        case 'VClosure': argName = val.name; break;
        default: argName = 't'; break;
      }

      let arg = freshen(used, argName);
      let argVal: Value = { tag: 'VNeutral', type: type.arg, val: { tag: 'NVar', name: arg } };

      return { tag: 'Lam', name: arg, expr: readBack(used.concat([arg]), type.res, doApplyE(val, argVal)) };
  }
}

function readBackNeutral(used: Name[], nval: Neutral): Expr {
  switch (nval.tag) {
    case 'NVar': return { tag: 'Var', name: nval.name };
    case 'NApp': return { tag: 'App', fun: readBackNeutral(used, nval.fun), arg: readBackNormal(used, nval.arg) };
    case "NRec": return {
      tag: 'Rec',
      type: nval.type, n: readBackNeutral(used, nval.n),
      start: readBackNormal(used, nval.start),
      step: readBackNormal(used, nval.step)
    };
  }
}

function readBackNormal(used: Name[], norm: Normal): Expr {
  return readBack(used, norm.type, norm.val);
}