import * as utils from "./utils";

test("pipe composes functions in the order they're provided", () => {
  const fn1 = jest.fn((arg0: any) => "return from fn1");
  const fn2 = jest.fn((arg0: any) => "return from fn2");
  const pipedFns = utils.pipe(fn1, fn2);

  expect(pipedFns("arg0")).toBe("return from fn2");
  expect(fn1.mock.calls.length).toBe(1);
  expect(fn2.mock.calls.length).toBe(1);
  expect(fn1.mock.calls[0][0]).toBe("arg0");
  expect(fn2.mock.calls[0][0]).toBe("return from fn1");
});

describe("whenDefined", () => {
  const innerFn = jest.fn(() => "return from innerFn");

  test("runs argument function when provided argument is not undefined", () => {
    const wrappedFn = utils.whenDefined(innerFn);
    wrappedFn("input to wrapped");

    expect(innerFn.mock.calls.length).toBe(1);
    expect(innerFn.mock.calls[0]).toEqual(["input to wrapped"]);
  });

  test("skips inner function call if provided argument is undefined", () => {
    const wrappedFn = utils.whenDefined(innerFn);
    wrappedFn(undefined);

    expect(innerFn.mock.calls.length).toBe(0);
  });
});
