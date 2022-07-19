import { Value } from "../value";
import { App } from "../../expr";
import { Neutral } from "./neutral";
import { VNeutral } from "./vneutral";

export class NApp extends Neutral {
  constructor(public fun: Neutral, public arg: Value) {
    super();
  }

  readBack(used: string[]) {
    let fun = new VNeutral(this.fun).readBack(used);
    let arg = this.arg.readBack(used);

    return new App(fun, arg);
  }
}