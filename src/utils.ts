type UnaryFn<In, Out> = (arg0: In) => Out;

export function pipe<A, B, C>(
  fn1: (arg0: A) => B,
  fn2: (arg0: B) => C
): (arg0: A) => C;
export function pipe<A, B, C, D>(
  fn1: (arg0: A) => B,
  fn2: (arg0: B) => C,
  fn3: (arg0: C) => D
): (arg0: A) => D;
export function pipe<A, B, C, D, E>(
  fn1: (arg0: A) => B,
  fn2: (arg0: B) => C,
  fn3: (arg0: C) => D,
  fn4: (arg0: D) => E
): (arg0: A) => E;
export function pipe<A, B, C, D, E, F>(
  fn1: (arg0: A) => B,
  fn2: (arg0: B) => C,
  fn3: (arg0: C) => D,
  fn4: (arg0: D) => E,
  fn5: (arg0: E) => F
): (arg0: A) => F;
export function pipe<A, B, C, D, E, F, G>(
  fn1: (arg0: A) => B,
  fn2: (arg0: B) => C,
  fn3: (arg0: C) => D,
  fn4: (arg0: D) => E,
  fn5: (arg0: E) => F,
  fn6: (arg0: F) => G
): (arg0: A) => G;
export function pipe<In, Out>(
  fn1: (arg0: In) => any,
  ...fns: Function[]
): UnaryFn<In, Out> {
  return fns.reduce((result, fn) => {
    return (input: any) => fn(result(input));
  }, fn1) as UnaryFn<In, Out>;
}

export function whenDefined<In, Out>(
  fn: UnaryFn<In, Out>
): UnaryFn<In | undefined, Out | undefined> {
  return (maybeArg: In | undefined) => {
    if (maybeArg !== undefined) {
      return fn(maybeArg);
    }
  };
}

export function when<In, Out>(
  predicate: UnaryFn<In, boolean>,
  fn: UnaryFn<In, Out>
): UnaryFn<In, Out | undefined> {
  return (arg0: In) => {
    if (predicate(arg0)) {
      return fn(arg0);
    }
  };
}

export function prop<T extends Object, P extends keyof T = keyof T>(
  prop: P
): (obj: T) => T[P] {
  return (inputObject: T) => inputObject[prop];
}

export function log<T>(transform: UnaryFn<T, any> = identity): UnaryFn<T, T> {
  return (inputObject: T) => {
    console.log(transform(inputObject));

    return inputObject;
  };
}

export function logLater<T>(
  transform: UnaryFn<T, any> = identity
): UnaryFn<T, T> {
  return (inputObject: T) => {
    setTimeout(() => {
      console.log(transform(inputObject));
    }, 0);

    return inputObject;
  };
}

export function constantFn<T>(value: T): (...args: any[]) => T {
  return () => value;
}

export function identity<T>(value: T): T {
  return value;
}
