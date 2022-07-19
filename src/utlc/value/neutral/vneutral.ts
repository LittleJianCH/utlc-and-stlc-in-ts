import { Value } from "../value";
import { Neutral } from "./neutral";
import { NApp } from "./napp";
import { Name } from "../../basic";

export class VNeutral extends Value {
  constructor(public neutral: Neutral) {
    super();
  }

  doApply(val: Value) {
    return new VNeutral(new NApp(this.neutral, val));
  }

  readBack(used: Name[]) {
    return this.neutral.readBack(used);
  }
}