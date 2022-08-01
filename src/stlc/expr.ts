import { Name } from "./basic";
import { Type } from "./type";

export type Expr = { tag: 'Var'; name: Name }
                 | { tag: 'Lam'; name: Name; expr: Expr }
                 | { tag: 'App'; fun: Expr; arg: Expr }
                 | { tag: 'Zero' }
                 | { tag: 'Succ'; arg: Expr }
                 | { tag: 'Rec'; type: Type; n: Expr; start: Expr; iter: Expr } // iter^n(start)
                 | { tag: 'Ann'; expr: Expr; type: Type }; // expr \in type
  