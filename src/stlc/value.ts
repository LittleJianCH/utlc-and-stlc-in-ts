import { Name } from "./basic";
import { Expr } from "./expr";
import { Type } from "./type";
import { Neutral } from "./neutral";
import { Environment } from "./env";

export type Value = { tag: 'VZero' }
                  | { tag: 'VSucc'; val: Value }
                  | { tag: 'VClosure'; name: Name; expr: Expr; env: Environment }
                  | { tag: 'VNeutral'; type: Type; val: Neutral };

export type Normal = { type: Type; val: Value };