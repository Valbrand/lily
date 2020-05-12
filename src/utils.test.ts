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

describe("when function", () => {
  const innerFn = jest.fn().mockReturnValue("return from innerFn");

  test("runs argument function when predicate returns true", () => {
    const predicate = jest.fn().mockReturnValue(true);
    const subject = utils.when(predicate, innerFn);

    expect(subject("input to when")).toBe("return from innerFn");
    expect(predicate).toHaveBeenCalledWith("input to when");
    expect(innerFn).toHaveBeenCalledWith("input to when");
  });

  test("skips argument function when predicate returns false", () => {
    const predicate = jest.fn().mockReturnValue(false);
    const subject = utils.when(predicate, innerFn);

    expect(subject("input to when")).toBe(undefined);
    expect(predicate).toHaveBeenCalledWith("input to when");
    expect(innerFn).not.toHaveBeenCalled();
  });
});

describe("prop returns a getter for a property in a given object", () => {
  const propGetter = utils.prop<{ foo: any }>("foo");

  test("in an object that contains the property key", () => {
    const object = { foo: "bar" };

    expect(propGetter(object)).toBe("bar");
  });

  test("in an object that does not contain the property key", () => {
    const unknownInput: unknown = { baz: "qux" };

    expect(propGetter(unknownInput as { foo: any })).toBe(undefined);
  });
});

describe("constantFn", () => {
  test("returns a constant function", () => {
    const constant = utils.constantFn("constant return value");

    expect(constant()).toBe("constant return value");
    expect(constant("one arg")).toBe("constant return value");
    expect(constant("multiple", "arguments")).toBe("constant return value");
  });
});

describe("identity", () => {
  test("returns given argument", () => {
    expect(utils.identity("argument")).toBe("argument");
  });

  test("no copy of the argument is made", () => {
    const testInput = { foo: "bar" };

    expect(utils.identity(testInput)).toBe(testInput);
  });
});

describe("log", () => {
  let actualLog = console.log;
  const mockLog = jest.fn();

  beforeAll(() => {
    console.log = mockLog;
  });

  afterAll(() => {
    console.log = actualLog;
  });

  test("logs input passed to transform fn, then returns original value", () => {
    const transformFn = jest.fn().mockReturnValue("return from transform");
    const logger = utils.log(transformFn);

    expect(logger("input to log")).toBe("input to log");
    expect(transformFn).toHaveBeenCalledWith("input to log");
    expect(mockLog).toHaveBeenCalledWith("return from transform");
  });

  test("transformFn defaults to identity", () => {
    const logger = utils.log();

    expect(logger("input to log")).toBe("input to log");
    expect(mockLog).toHaveBeenCalledWith("input to log");
  });
});
