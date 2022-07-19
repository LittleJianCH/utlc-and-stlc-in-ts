import { Expr } from "../../expr";
import { Name } from "../../basic";

export abstract class Neutral {
  abstract readBack(used: Name[]): Expr;
}