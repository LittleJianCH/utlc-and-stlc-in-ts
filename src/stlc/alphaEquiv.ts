import { Expr } from "./expr";
import { str } from "./basic";

export function alphaEquiv(e1: Expr, e2: Expr, namePair: string[]): boolean {
  if (e1.tag === 'Var' && e2.tag === 'Var') {
    return namePair.includes(str([e1.name, e2.name]));
  } else if (e1.tag === 'Lam' && e2.tag === 'Lam') {
    return alphaEquiv(e1.expr, e2.expr, namePair.concat([str([e1.name, e2.name])]));
  } else if (e1.tag === 'Zero' && e2.tag === 'Zero') {
    return true;
  } else if (e1.tag === 'Succ' && e2.tag === 'Succ') {
    return alphaEquiv(e1.arg, e2.arg, namePair);
  } else if (e1.tag === 'Rec' && e2.tag === 'Rec') {
    return alphaEquiv(e1.n, e2.n, namePair) &&
           alphaEquiv(e1.start, e2.start, namePair) &&
           alphaEquiv(e1.iter, e2.iter, namePair);
  } else {
    return false;
  }
}