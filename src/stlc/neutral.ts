import { Name } from "./basic";
import { Normal } from "./value";
import { Type } from "./type";

export type Neutral = { tag: 'NVar'; name: Name }
                    | { tag: 'NApp'; fun: Neutral; arg: Normal }
                    | { tag: 'NRec'; type: Type; n: Neutral; start: Normal; iter: Normal };