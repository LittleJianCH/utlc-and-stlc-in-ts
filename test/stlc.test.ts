import * as Stlc from "../src/stlc";

let str = JSON.stringify;

let ctx: Stlc.Context = {
  ['f']: { tag: 'TArr', arg: { tag: 'TNat' }, res: { tag: 'TNat' } },
  ['x']: { tag: 'TNat' }
};

test('test context', () => {
  expect(Stlc.synth(ctx, { tag: 'Var', name: 'f' }))
    .toEqual({ tag: 'TArr', arg: { tag: 'TNat' }, res: { tag: 'TNat' } });
  expect(Stlc.check(ctx, { tag: 'App', 
                           fun: { tag: 'Var', name: 'f' },
                           arg: { tag: 'Var', name: 'x' } }
                       , { tag: 'TNat' }))
    .toEqual(true);
});

function variable(name: string): Stlc.Expr {
  return { tag: 'Var', name };
}

let zero: Stlc.Expr = { tag: 'Zero' };
let one: Stlc.Expr = { tag: 'Succ', arg: zero };
let two: Stlc.Expr = { tag: 'Succ', arg: one };
let three: Stlc.Expr = { tag: 'Succ', arg: two };
let tnat: Stlc.Type = { tag: 'TNat' };
let tn2n: Stlc.Type = { tag: 'TArr', arg: tnat, res: tnat };
let tnn2n: Stlc.Type = { tag: 'TArr', arg: tnat, res: tn2n };
let id: Stlc.Expr = { tag: 'Lam', name: 'x', expr: variable('x') };
let idAnn: Stlc.Expr = { tag: 'Ann', expr: id, type: tn2n };
let id_: Stlc.Expr = { tag: 'Lam', name: 't', expr: id };
let id_Ann: Stlc.Expr = { tag: 'Ann', expr: id_, type: tnn2n };

test('test synth', () => {
  expect(Stlc.synth({}, zero)).toEqual(tnat);
  expect(Stlc.synth({}, { tag: 'Succ', arg: zero })).toEqual(tnat);

  expect(Stlc.synth({}, { tag: 'Rec', type: tnat, n: one, start: zero, step: id_Ann }))
    .toEqual(tnat);

  expect(Stlc.synth({}, { 
    tag: 'App', 
    fun: { 
      tag: 'Ann', 
      expr: id, 
      type: tn2n
    },
    arg: zero 
  })).toEqual({ tag: 'TNat' });
});

test('test synth with undefined variable', () => {
  expect(Stlc.synth({}, variable('x'))).toEqual('Undefined variable x');
});

test('test synth with type error', () => {
  expect(Stlc.synth({}, id))
    .toEqual(`Cannot find a type for ${str(id)}, Please add a type annotation`);
  
  expect(Stlc.synth({}, { tag: 'Rec', type: tnat, n: idAnn, start: zero, step: id_Ann }))
      .toEqual(Stlc.unmatchedType(idAnn, tnat).message);
  
  expect(Stlc.synth({}, { tag: 'Rec', type: tnat, n: one, start: zero, step: one }))
    .toEqual(Stlc.unmatchedType(one, tnn2n).message);
 
  expect(Stlc.synth({}, { 
    tag: 'App',
    fun: zero,
    arg: zero
  })).toEqual(`Not a function type: ${str(tnat)}`);
});

test('test check', () => {
  // Since our stlc isn't syntax-directed, id can be treated as multiple types
  expect(Stlc.check({}, id, tn2n))
    .toEqual(true);
  expect(Stlc.check({}, id, { tag: 'TArr', arg: tnat, res: tnat }))
    .toEqual(true);
  
  // But not a nat, Obviously
  expect(Stlc.check({}, id, tnat))
    .toEqual(`Cannot match ${str(id)} against ${str(tnat)}`);
});

test('test runProgramOfType', () => {
  function applyNTimes(n: number, f: Stlc.Expr, x: Stlc.Expr): Stlc.Expr {
    for (let i = 0; i < n; i++) {
      x = { tag: 'App', fun: f, arg: x };
    }
    return x;
  }
  let defs: [Stlc.Name, Stlc.Expr][] = [
    ['zero', { tag: 'Zero' }],
    ['suc', { tag: 'Ann', 
              type: tn2n,
              expr: { tag: 'Lam', name: 'x', expr: { tag: 'Succ', arg: variable('x') } } }],
    ['suc_', { tag: 'Ann',
               type: tnn2n,
               expr: { tag: 'Lam', name: 'x', expr: variable('suc') } }],
    ['five', applyNTimes(5, variable('suc'), variable('zero'))],
    ['add', { tag: 'Ann',
              type: { tag: 'TArr', arg: tnat, res: tn2n },
              expr: { tag: 'Lam', name: 'x', 
                      expr: { tag: 'Lam', name: 'y', 
                              expr: { tag: 'Rec', 
                                      type: tnat,
                                      n: variable('x'),
                                      start: variable('y'),
                                      step: { tag: 'Var', name: 'suc_' } } } } }]
  ];

  expect(Stlc.runProgramOfType(defs, { tag: 'App', fun: variable('add'), arg: variable('five') }))
    .toEqual(tn2n);
});

let succ: Stlc.Expr = {
  tag: 'Ann',
  type: tn2n,
  expr: { tag: 'Lam', name: 'x', expr: { tag: 'Succ', arg: { tag: 'Var', name: 'x' } } }
};
let succ_: Stlc.Expr = {
  tag: 'Ann',
  type: tnn2n,
  expr: { tag: 'Lam', name: 'x', expr: succ }
};
let vzero: Stlc.Value = { tag: 'VZero' };
let vone: Stlc.Value = { tag: 'VSucc', val: vzero };
let vtwo: Stlc.Value = { tag: 'VSucc', val: vone };
let vthree: Stlc.Value = { tag: 'VSucc', val: vtwo };
let vfour: Stlc.Value = { tag: 'VSucc', val: vthree };
let vfive: Stlc.Value = { tag: 'VSucc', val: vfour };
let vsix: Stlc.Value = { tag: 'VSucc', val: vfive };
let add: Stlc.Expr = {
  tag: 'Ann',
  type: { tag: 'TArr', arg: tnat, res: tn2n },
  expr: {
    tag: 'Lam',
    name: 'x',
    expr: {
      tag: 'Lam',
      name: 'y',
      expr: {
        tag: 'Rec',
        type: tnat,
        n: { tag: 'Var', name: 'x' },
        start: { tag: 'Var', name: 'y' },
        step: succ_
      }
    }
  }
};
let guass: Stlc.Expr = { tag: 'Ann', type: tn2n,
  expr: { tag: 'Lam', name: 'x',
    expr: {
      tag: 'Rec',
      type: tnat,
      n: { tag: 'Var', name: 'x' },
      start: zero,
      step: add
    }
  }
};

test('test eval', () => {
  expect(Stlc.evalExpr(zero)).toEqual({ tag: 'VZero' });
  expect(Stlc.evalExpr({ tag: 'App', fun: succ, arg: zero })).toEqual(vone);
  expect(Stlc.evalExpr({
    tag: 'App',
    fun: {
      tag: 'App',
      fun: add,
      arg: two,
    },
    arg: three
  })).toEqual(vfive);

  expect(Stlc.evalExpr(id))
    .not.toEqual({"env": {}, "expr": {"name": "x", "tag": "Var"}, "name": "x", "tag": "VClosure"});
  expect(Stlc.evalExpr({ tag: 'Ann', type: tn2n, expr: id }))
    .toEqual({"env": {}, "expr": {"name": "x", "tag": "Var"}, "name": "x", "tag": "VClosure"});
  expect(Stlc.evalExpr({ tag: 'App', fun: { tag: 'Ann', type: tnat, expr: id }, arg: zero }))
    .not.toEqual(vzero);

  expect(Stlc.evalExpr({ tag: 'App', fun: guass, arg: three }))
    .toEqual(vsix);
});

function compose(f: Stlc.Expr, g: Stlc.Expr, type: Stlc.Type): Stlc.Expr {
  return { tag: 'Ann', type: type, expr: {
    tag: 'Lam', name: 'x',
    expr: {
      tag: 'App',
      fun: f,
      arg: {
        tag: 'App',
        fun: g,
        arg: { tag: 'Var', name: 'x' }
      }
    }
  } };
}

function flip(f: Stlc.Expr, arg1Type: Stlc.Type, arg2Type: Stlc.Type, retType: Stlc.Type): Stlc.Expr {
  return {
    tag: 'Ann', type: { tag: 'TArr', arg: arg2Type, res: { tag: "TArr", arg: arg1Type, res: retType } },
    expr: { tag: 'Lam', name: 'a',
      expr: { tag: 'Lam', name: 'b',
        expr: {
          tag: 'App',
          fun: {
            tag: 'App',
            fun: f,
            arg: variable('b')
          },
          arg: variable('a')
        }
      }
    }
  };
}


test('test exprEqual', () => {
  expect(Stlc.exprEqual(zero, zero)).toEqual(true);
  expect(Stlc.exprEqual(zero, one)).toEqual(false);

  let succ1: Stlc.Expr = succ;
  let succ2: Stlc.Expr = { tag: 'Ann', type: tn2n, expr: {
    tag: 'Lam', name: 'x',
    expr: { tag: 'Rec', type: tnat, n: one, start: variable('x') , step: succ_ }
  } };
  expect(Stlc.exprEqual(succ1, succ2)).toEqual(true);

  let sssucc1: Stlc.Expr = { tag: 'Ann', type: tn2n, expr: compose(compose(succ, succ, tn2n), succ, tn2n) };
  let sssucc2: Stlc.Expr = { tag: 'Ann', type: tn2n, expr: compose(succ, compose(succ, succ, tn2n), tn2n) };
  let sssucc3: Stlc.Expr = { tag: 'Ann', type: tn2n, expr: {
    tag: 'Lam', name: 'x',
    expr: { tag: 'Rec', type: tnat, n: three, start: variable('x') , step: succ_ }
  } };
  expect(Stlc.exprEqual(sssucc1, sssucc2)).toEqual(true);
  expect(Stlc.exprEqual(sssucc1, sssucc3)).toEqual(true);
  expect(Stlc.exprEqual(sssucc2, sssucc3)).toEqual(true);
  expect(Stlc.exprEqual(sssucc1, succ1)).toEqual(false);

  let id1: Stlc.Expr = { tag: 'Ann', type: tn2n, expr: id };
  let id2: Stlc.Expr = compose(id1, id1, tn2n);
  expect(Stlc.exprEqual(id1, id2)).toEqual(true);

  let add1: Stlc.Expr = add;
  let add2: Stlc.Expr = flip(flip(add1, tnat, tnat, tnat), tnat, tnat, tnat);
  let add3: Stlc.Expr = flip(add1, tnat, tnat, tnat);
  expect(Stlc.exprEqual(add1, add2)).toEqual(true);
  expect(Stlc.exprEqual(add1, add3)).toEqual(false);

  let apply1: Stlc.Expr = {
    tag: 'Ann', type: { tag: 'TArr', arg: tn2n, res: tn2n },
    expr: {
      tag: 'Lam', name: 'f',
      expr: {
        tag: 'Lam', name: 'x',
        expr: {
          tag: 'App',
          fun: variable('f'),
          arg: variable('x')
        }
      }
    }
  };
  let apply2: Stlc.Expr = flip(flip(apply1, tn2n, tnat, tnat), tnat, tn2n, tnat);
  expect(Stlc.exprEqual(apply1, apply2)).toEqual(true);

  let f1: Stlc.Expr = { tag: 'Ann', type: { tag: 'TArr', arg: tnn2n, res: tnn2n },
    expr: {
      tag: 'Lam', name: 'f',
      expr: flip(flip(variable('f'), tnat, tnat, tnat), tnat, tnat, tnat)
    }
  };
  let f2: Stlc.Expr = { tag: 'Ann', type: { tag: 'TArr', arg: tnn2n, res: tnn2n },
    expr: {
      tag: 'Lam', name: 'f',
      expr: variable('f')
    }
  };
  expect(Stlc.exprEqual(f1, f2)).toEqual(true);

  let expr1: Stlc.Expr = {
    tag: 'Ann', type: { tag: 'TArr', arg: tn2n, res: tn2n },
    expr: {
      tag: 'Lam', name: 'f',
      expr: variable('f')
    }
  };
  let expr2: Stlc.Expr = {
    tag: 'Ann', type: tn2n,
    expr: {
      tag: 'Lam', name: 'f',
      expr: variable('f')
    }
  };

  expect(Stlc.exprEqual(expr1, expr2)).toEqual(false);
});

function hole(id: number): Stlc.Expr {
  return { tag: 'Hole', id: id };
}

test('test Hole', () => {
  let expr1: Stlc.Expr = hole(1);
  expect(Stlc.check({}, expr1, tnat)).toEqual(new Stlc.HoleInformation(1, tnat).message);

  let expr2: Stlc.Expr = { tag: 'Lam', name: 'x', expr: hole(1) };
  expect(Stlc.check({}, expr2, { tag: 'TArr', arg: tn2n, res: tn2n }))
    .toEqual(new Stlc.HoleInformation(1, tn2n).message);
  expect(Stlc.check({}, expr2, tnat))
    .toEqual(Stlc.unmatchedType(expr2, tnat).message);

  let expr3: Stlc.Expr = { tag: 'Rec', n: two, start: hole(1), step: id, type: tn2n };
  expect(Stlc.check({}, expr3, tn2n))
    .toEqual(new Stlc.HoleInformation(1, tn2n).message);
});

let tnpp: Stlc.Type = { tag: 'TPair', car: tnat, cdr: tnat };
let tn2pnn: Stlc.Type = { tag: 'TArr', arg: tnat, res: tnpp };
let tnn2pnn: Stlc.Type = { tag: 'TArr', arg: tnat, res: tn2pnn };

test('test Pair', () => {
  let pairZeroZero: Stlc.Expr = { tag: 'Cons', car: zero, cdr: zero };
  expect(Stlc.synth({}, pairZeroZero)).toEqual(tnpp);

  let carPairZeroZero: Stlc.Expr = { tag: 'Car', arg: pairZeroZero };
  let cdrPairZeroZero: Stlc.Expr = { tag: 'Cdr', arg: pairZeroZero };
  expect(Stlc.synth({}, carPairZeroZero)).toEqual(tnat);
  expect(Stlc.synth({}, cdrPairZeroZero)).toEqual(tnat);

  let f1: Stlc.Expr = { tag: 'Ann', type: tnn2n,
    expr: { tag: 'Lam', name: 'x',
      expr: { tag: 'Lam', name: 'y',
        expr: {
          tag: 'Car',
          arg: { tag: 'Cons', car: variable('x'), cdr: variable('y') } }
      }
    }
  };
  let f2: Stlc.Expr = { tag: 'Ann', type: tnn2n,
    expr: { tag: 'Lam', name: 'y',
      expr: { tag: 'Lam', name: 'x',
        expr: {
          tag: 'Cdr',
          arg: { tag: 'Cons', car: variable('x'), cdr: variable('y') } }
      }
    }
  };
  let f3: Stlc.Expr = { tag: 'Ann', type: tnn2n,
    expr: { tag: 'Lam', name: 'x',
      expr: { tag: 'Lam', name: 'y',
        expr: variable('x')
      }
    }
  };
  expect(Stlc.exprEqual(f1, f2)).toEqual(true);
  expect(Stlc.exprEqual(f1, f3)).toEqual(true);
  expect(Stlc.exprEqual(f2, f3)).toEqual(true);

  let f4: Stlc.Expr = {
    tag: 'Ann', type: tnn2pnn,
    expr: { tag: 'Lam', name: 'x',
      expr: { tag: 'Lam', name: 'y',
        expr: { tag: 'Cons', car: variable('x'), cdr: variable('y') }
      }
    }
  };
  let f5: Stlc.Expr = {
    tag: 'Ann', type: tnn2pnn,
    expr: { tag: 'Lam', name: 'x',
      expr: { tag: 'Lam', name: 'y',
        expr: { tag: 'Cons', car: variable('y'), cdr: variable('x') }
      }
    }
  };
  let f6: Stlc.Expr = flip(f5, tnat, tnat, tnpp);
  expect(Stlc.exprEqual(f4, f5)).toEqual(false);
  expect(Stlc.exprEqual(f4, f6)).toEqual(true);

  let car: Stlc.Expr = { tag: 'Ann', type: { tag: 'TArr', arg: tnpp, res: tnat },
    expr: { tag: 'Lam', name: 'p',
      expr: { tag: 'Car', arg: variable('p') }
    }
  };
  let cdr: Stlc.Expr = { tag: 'Ann', type: { tag: 'TArr', arg: tnpp, res: tnat },
    expr: { tag: 'Lam', name: 'p',
      expr: { tag: 'Cdr', arg: variable('p') }
    }
  };
  expect(Stlc.exprEqual(car, cdr)).toEqual(false);
});