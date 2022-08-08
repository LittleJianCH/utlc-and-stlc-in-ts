export type Type = { tag: 'TNat' }
                 | { tag: 'TArr'; arg: Type; res: Type } // arg -> res
                 | { tag: 'TPair'; car: Type; cdr: Type };

export function multArgFunc(args: Type[]): Type {
  if (args.length === 0) {
    throw new Error('At least one argument is required');
  } else if (args.length === 1) {
    return args[0];
  } else {
    return { tag: 'TArr', arg: args[0], res: multArgFunc(args.slice(1)) };
  }
}