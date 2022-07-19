import { Neutral } from "./neutral";
import { Name } from "../../basic";
import { Var } from "../../expr";

export class NVar extends Neutral {
  constructor(public name: Name) {
    super();
  }
  
  readBack(used: Name[]) {
    return new Var(this.name); // this.name is impossible to be used here
  }
}