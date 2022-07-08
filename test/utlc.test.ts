import { Utlc } from "../src/utlc";

test('test empty enviorment', () => {
  let env = {};
  let name = 'name';
  let expr = new Utlc.Var(name);
  let value = { env, name, expr };
  expect(value).toEqual({ env, name, expr });
});

test('test eval', () => {
  let env = {};
  let fun = new Utlc.Lam('x', new Utlc.App(
    new Utlc.Var('x'),
    new Utlc.Var('x')
  ));
  let arg = new Utlc.Lam('x', new Utlc.Var('x'));

  expect(Utlc.evalExpr(new Utlc.App(fun, arg), {}))
    .toEqual({ env: {}, name: 'x', expr: new Utlc.Var('x') });
});

test('test eval with undefined variable', () => {
  let env = {
    ['f']: new Utlc.VClosure({}, 'f', new Utlc.Lam('x', new Utlc.Var('x')))
  };
  let x = new Utlc.Var('x');
  let y = new Utlc.Var('y');
  let expr1 = new Utlc.App(x, y);
  let expr2 = new Utlc.App(new Utlc.Var('f'), y);

  expect(Utlc.evalExpr(x, {})).toEqual('Undefined variable x');
  expect(Utlc.evalExpr(expr1, env)).toEqual('Undefined variable x');
  expect(Utlc.evalExpr(expr2, env)).toEqual('Undefined variable y');
});

test('test runProgram', () => {
  let env = {};

  let id = new Utlc.Lam('x', new Utlc.Var('x'));
  let apply_id = new Utlc.App(
    new Utlc.Var('id'),
    new Utlc.Lam('x', new Utlc.Var('x')) 
  );
  let var_f = new Utlc.Var('f');

  expect(Utlc.runProgram([["id", id], ["f", apply_id]], var_f))
    .toEqual({
      env: {
        ['id']: { env: {}, name: 'x', expr: new Utlc.Var('x') },
      },
      name: 'x', 
      expr: new Utlc.Var('x')
    });
  
  expect(Utlc.runProgram([["f", apply_id]], var_f)).toEqual("Undefined variable id");
});

module Church {
  export const zero = new Utlc.Lam('f', new Utlc.Lam('x', new Utlc.Var('x')));

  export const succ = new Utlc.Lam('n', new Utlc.Lam('f', new Utlc.Lam('x',
    new Utlc.App(
      new Utlc.Var('f'),
      new Utlc.App(
        new Utlc.App(
          new Utlc.Var('n'),
          new Utlc.Var('f')
        ),
        new Utlc.Var('x')
      )
  ))));

  export const add = new Utlc.Lam('n1', new Utlc.Lam('n2', new Utlc.Lam('f', new Utlc.Lam('x',
    new Utlc.App(
      new Utlc.App(
        new Utlc.Var('n1'),
        new Utlc.Var('f')
      ),
      new Utlc.App(
        new Utlc.App(
          new Utlc.Var('n2'),
          new Utlc.Var('f')
        ),
        new Utlc.Var('x')
      )
    )
  ))));

  export function fromInt(n: number): Utlc.Expr {
    if (n == 0) return zero;
    else return new Utlc.App(succ, fromInt(n - 1));
  };
}

test('test Church Number', () => {
  const churchDefs: [Utlc.Name, Utlc.Expr][] = [
    ['zero', Church.zero],
    ['succ', Church.succ],
    ['add', Church.add],
    ['fx', new Utlc.Lam('f', new Utlc.Lam('x', new Utlc.Var('f')))],
    ['id', new Utlc.Lam('x', new Utlc.Var('x'))]
  ];

  const prog1 = new Utlc.App(
    new Utlc.App(
      new Utlc.App(
        new Utlc.App(
          new Utlc.Var('add'),
          Church.fromInt(5)
        ),
        Church.fromInt(4)
      ),
      new Utlc.Var('fx')
    ), 
    new Utlc.Var('id')
  );

  const prog2 = new Utlc.App(
    new Utlc.App(
      Church.fromInt(9),
      new Utlc.Var('fx')
    ),
    new Utlc.Var('id')
  );

  const prog3 = new Utlc.App(
    new Utlc.App(
      Church.fromInt(10),
      new Utlc.Var('fx')
    ),
    new Utlc.Var('id')
  );

  expect(Utlc.runProgram(churchDefs, prog1))
    .toEqual(Utlc.runProgram(churchDefs, prog2));
  expect(Utlc.runProgram(churchDefs, prog1))
    .not.toEqual(Utlc.runProgram(churchDefs, prog3));
});

test('test normalize', () => {
  let expr1 = new Utlc.Lam('x', new Utlc.Var('x'));
  let expr2 = new Utlc.Var('x');
  let expr3 = new Utlc.App(expr1, expr1);
  let churchExpr = new Utlc.App(
    new Utlc.App(
      Church.add,
      Church.fromInt(3)
    ),
    Church.fromInt(9)
  );

  expect(Utlc.normalize(expr1)).toEqual(new Utlc.Lam('x', new Utlc.Var('x')));
  expect(Utlc.normalize(expr2)).toEqual('Undefined variable x');
  expect(Utlc.normalize(expr3)).toEqual(new Utlc.Lam('x', new Utlc.Var('x')));

  // Normalizing is useful to identify two expr
  expect(Utlc.normalize(churchExpr)).toEqual(Utlc.normalize(Church.fromInt(12)));
  expect(Utlc.normalize(churchExpr)).not.toEqual(Utlc.normalize(Church.fromInt(13)));
});

test('test freshen', () => {
  let expr = new Utlc.Lam('x', 
    new Utlc.Lam('x', new Utlc.Var('x'))
  );

  expect(Utlc.normalize(expr))
    .toEqual(new Utlc.Lam('x',
      new Utlc.Lam("x'", new Utlc.Var("x\'"))
    ));
});