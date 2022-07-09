import { Stlc } from "../src/stlc";

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

let zero: Stlc.Expr = { tag: 'Zero' };
let one: Stlc.Expr = { tag: 'Succ', arg: zero };
let tnat: Stlc.Type = { tag: 'TNat' };
let tn2n: Stlc.Type = { tag: 'TArr', arg: tnat, res: tnat };
let id: Stlc.Expr = { tag: 'Lam', name: 'x', expr: { tag: 'Var', name: 'x' } };
let idAnn: Stlc.Expr = { tag: 'Ann', expr: id, type: tn2n };

test('test synth', () => {
  expect(Stlc.synth({}, zero)).toEqual(tnat);
  expect(Stlc.synth({}, { tag: 'Succ', arg: zero })).toEqual(tnat);

  expect(Stlc.synth({}, { tag: 'Rec', type: tnat, n: one, b: zero, s: idAnn }))
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
  expect(Stlc.synth({}, {
    tag: 'Var',
    name: 'x'
  })).toEqual('Undefined variable x');
});

test('test synth with type error', () => {
  expect(Stlc.synth({}, id))
    .toEqual(`Cannot find a type for ${str(id)}, Please add a type annotation`);
  
  expect(Stlc.synth({}, { tag: 'Rec', type: tnat, n: idAnn, b: zero, s: idAnn }))
    .toEqual(`Not a nat type: ${str(tn2n)}`);
  
  expect(Stlc.synth({}, { tag: 'Rec', type: tnat, n: one, b: zero, s: one }))
    .toEqual(`Cannot match ${str(one)} against ${str(tn2n)}`);
 
  expect(Stlc.synth({}, { 
    tag: 'App',
    fun: zero,
    arg: zero
  })).toEqual(`Not a function type: ${str(tnat)}`);
});

test('test check', () => {
  // Since our stlc isn't syntax-directed, id can be treat as muitiple types
  expect(Stlc.check({}, id, tn2n))
    .toEqual(true);
  expect(Stlc.check({}, id, { tag: 'TArr', arg: tnat, res: tnat }))
    .toEqual(true);
  
  // But not a nat, Obviously
  expect(Stlc.check({}, id, tnat))
    .toEqual(`Cannot match ${str(id)} against ${str(tnat)}`);
});