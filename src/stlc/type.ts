export type Type = { tag: 'TNat' }
                 | { tag: 'TArr'; arg: Type; res: Type }; // arg -> res