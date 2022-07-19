import { Name } from "../basic";
import { Expr } from "../expr";

export abstract class Value {
  abstract doApply(val: Value): Value;
  abstract readBack(used: Name[]): Expr;
}