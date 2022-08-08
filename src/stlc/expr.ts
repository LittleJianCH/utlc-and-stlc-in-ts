import { Name } from "./basic";
import { Type } from "./type";

export type Expr = { tag: 'Var'; name: Name }
                 | { tag: 'Lam'; name: Name; expr: Expr }
                 | { tag: 'App'; fun: Expr; arg: Expr }
                 | { tag: 'Zero' }
                 | { tag: 'Succ'; arg: Expr }
                 | { tag: 'Rec'; type: Type; n: Expr; start: Expr; step: Expr } // Rec[n] start step
                 | { tag: 'Cons'; car: Expr; cdr: Expr }
                 | { tag: 'Car'; arg: Expr }
                 | { tag: 'Cdr'; arg: Expr }
                 | { tag: 'Ann'; expr: Expr; type: Type } // expr \in type
                 | { tag: 'Hole'; id: number }; // for query in proving
  