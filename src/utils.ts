export function pipe<In, T1, Out>(
  f1: (arg0: In) => T1,
  f2: (arg0: T1) => Out
): (arg0: In) => Out {
  return input => f2(f1(input));
}

export function whenDefined<In>(
  fn: (arg0: In) => void
): (maybeArg: In | undefined) => void {
  return (maybeArg: In | undefined) => {
    if (maybeArg !== undefined) {
      fn(maybeArg);
    }
  };
}

export function prop<T, P extends keyof T>(prop: P): (obj: T) => T[P] {
  return (inputObject: T) => inputObject[prop];
}
