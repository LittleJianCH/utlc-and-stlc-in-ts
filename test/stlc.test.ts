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
let id: Stlc.Expr = { tag: 'Lam', name: 'x', expr: variable('x') };
let idAnn: Stlc.Expr = { tag: 'Ann', expr: id, type: tn2n };

test('test synth', () => {
  expect(Stlc.synth({}, zero)).toEqual(tnat);
  expect(Stlc.synth({}, { tag: 'Succ', arg: zero })).toEqual(tnat);

  expect(Stlc.synth({}, { tag: 'Rec', type: tnat, n: one, start: zero, iter: idAnn }))
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
  
  expect(Stlc.synth({}, { tag: 'Rec', type: tnat, n: idAnn, start: zero, iter: idAnn }))
    .toEqual(`Not a nat type: ${str(tn2n)}`);
  
  expect(Stlc.synth({}, { tag: 'Rec', type: tnat, n: one, start: zero, iter: one }))
    .toEqual(`Cannot match ${str(one)} against ${str(tn2n)}`);
 
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
    ['five', applyNTimes(5, variable('suc'), variable('zero'))],
    ['add', { tag: 'Ann',
              type: { tag: 'TArr', arg: tnat, res: tn2n },
              expr: { tag: 'Lam', name: 'x', 
                      expr: { tag: 'Lam', name: 'y', 
                              expr: { tag: 'Rec', 
                                      type: tnat,
                                      n: variable('x'),
                                      start: variable('y'),
                                      iter: { tag: 'Var', name: 'suc' } } } } }]
  ];

  expect(Stlc.runProgramOfType(defs, { tag: 'App', fun: variable('add'), arg: variable('five') }))
    .toEqual(tn2n);
});

let succ: Stlc.Expr = {
  tag: 'Ann',
  type: tn2n,
  expr: { tag: 'Lam', name: 'x', expr: { tag: 'Succ', arg: { tag: 'Var', name: 'x' } } }
};
let vzero: Stlc.Value = { tag: 'VZero' };
let vone: Stlc.Value = { tag: 'VSucc', val: vzero };
let vtwo: Stlc.Value = { tag: 'VSucc', val: vone };
let vthree: Stlc.Value = { tag: 'VSucc', val: vtwo };
let vfour: Stlc.Value = { tag: 'VSucc', val: vthree };
let vfive: Stlc.Value = { tag: 'VSucc', val: vfour };
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
        iter: succ
      }
    }
  }
}

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
    expr: { tag: 'Rec', type: tnat, n: one, start: variable('x') , iter: succ }
  } };
  expect(Stlc.exprEqual(succ1, succ2)).toEqual(true);

  let sssucc1: Stlc.Expr = { tag: 'Ann', type: tn2n, expr: compose(compose(succ, succ, tn2n), succ, tn2n) };
  let sssucc2: Stlc.Expr = { tag: 'Ann', type: tn2n, expr: compose(succ, compose(succ, succ, tn2n), tn2n) };
  let sssucc3: Stlc.Expr = { tag: 'Ann', type: tn2n, expr: {
    tag: 'Lam', name: 'x',
    expr: { tag: 'Rec', type: tnat, n: three, start: variable('x') , iter: succ }
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
});