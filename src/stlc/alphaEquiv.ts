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
           alphaEquiv(e1.step, e2.step, namePair);
  } else if (e1.tag === 'App' && e2.tag === 'App') {
    return alphaEquiv(e1.fun, e2.fun, namePair) &&
           alphaEquiv(e1.arg, e2.arg, namePair);
  } else if (e1.tag === 'Cons' && e2.tag === 'Cons') {
    return alphaEquiv(e1.car, e2.car, namePair) &&
           alphaEquiv(e1.cdr, e2.cdr, namePair);
  } else if (e1.tag === 'Car' && e2.tag === 'Car') {
    return alphaEquiv(e1.arg, e2.arg, namePair);
  } else if (e1.tag === 'Cdr' && e2.tag === 'Cdr') {
    return alphaEquiv(e1.arg, e2.arg, namePair);
  } else {
    return false;
  }
}