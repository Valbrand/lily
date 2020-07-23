import { performance } from "perf_hooks";

type UnaryFn<In, Out> = (arg0: In) => Out;

const IS_DEBUG_MODE = process.env.VSCODE_DEBUG_MODE === "true";

export function noop(...args: any[]) {}

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

export function constantFn<T>(value: T): (...args: any[]) => T {
  return () => value;
}

export function identity<T>(value: T): T {
  return value;
}

export function isDefined<T>(arg: T | undefined): arg is T {
  return arg !== undefined;
}

export function mapObject<M extends { [K: string]: V }, V, V2>(
  original: M,
  transform: UnaryFn<V, V2>
): { [K2 in keyof M]: V2 } {
  return Object.keys(original).reduce(
    (result: Partial<{ [K2 in keyof M]: V2 }>, key: keyof M) => {
      result[key] = transform(original[key]);
      return result;
    },
    {}
  ) as { [K2 in keyof M]: V2 };
}

// Returns true if every element in input collection
// makes the predicate return true
export function every<T>(
  predicate: UnaryFn<T, boolean>
): UnaryFn<readonly T[], boolean> {
  return (input: readonly T[]) =>
    input.reduce<boolean>(
      (result, inputItem) => result && predicate(inputItem),
      true
    );
}

// Log fns - move later to another file

type LogType = "log" | "warn" | "error";

interface LogFn {
  <T = any>(input?: string, logType?: LogType): T;
  <T = any>(transform?: UnaryFn<T, any>, logType?: LogType): T;
}

export const log: LogFn = IS_DEBUG_MODE
  ? <T>(
      input: string | UnaryFn<T, any> = identity,
      logType: LogType = "log"
    ) => {
      let transformFn = input instanceof Function ? input : constantFn(input);

      return (inputObject: T) => {
        console[logType](transformFn(inputObject));

        return inputObject;
      };
    }
  : constantFn(identity);

export const logNow: (input: any, logType?: LogType) => void = IS_DEBUG_MODE
  ? (input: any, logType: LogType = "log") => {
      console[logType](input);
    }
  : noop;

type SyncLogger = <P extends any[], R>(
  label: string,
  fn: (...args: P) => R
) => (...args: P) => R;

type AsyncLogger = <P extends any[], R>(
  label: string,
  fn: (...args: P) => Promise<R>
) => (...args: P) => Promise<R>;

let nestingLevel = 0;
function spaces(nestingLevel: number): string {
  let result = "";

  for (let i = 0; i < nestingLevel; i++) {
    result += "..";
  }

  return result;
}

type PerformanceLogEntry = {
  label: string;
  startTime: number;
  endTime?: number;
  children: PerformanceLogEntry[];
};

type PerformanceLogReport = {
  label: string;
  totalDuration: number;
  selfDuration: number;
  children: PerformanceLogReport[];
};

const perfLogStack: PerformanceLogEntry[] = [];
let currentPerformanceLogContext: PerformanceLogEntry | undefined;

const performanceLogEntry = (
  label: string,
  startTime: number
): PerformanceLogEntry => ({
  label,
  startTime,
  children: [],
});

function setActiveLogEntry(logEntry: PerformanceLogEntry) {
  if (!!currentPerformanceLogContext) {
    currentPerformanceLogContext.children.push(logEntry);
  }

  currentPerformanceLogContext = logEntry;
  perfLogStack.push(logEntry);
}

function unsetActiveLogEntry() {
  currentPerformanceLogContext = perfLogStack.pop();
}

function shouldReportLogStack(): boolean {
  return perfLogStack.length === 0;
}

function performanceLogReport(
  logEntry: PerformanceLogEntry
): PerformanceLogReport {
  const { label, startTime, endTime, children } = logEntry;

  if (endTime === undefined) {
    throw new Error(`log entry with label ${label} didn't have an endTime`);
  }

  const childrenReports = children.map(performanceLogReport);
  const totalDuration = endTime - startTime;
  const selfDuration =
    totalDuration -
    childrenReports
      .map((report) => report?.totalDuration)
      .reduce((result, duration) => result + duration, 0);

  return {
    label,
    totalDuration,
    selfDuration,
    children: childrenReports,
  };
}

function __performanceLogReportInTextFormat(
  { label, totalDuration, selfDuration, children }: PerformanceLogReport,
  nestingLevel: number
): string {
  return `${spaces(
    nestingLevel
  )}${label} took ${totalDuration}ms (self: ${selfDuration}ms)\n${children
    .map((report) =>
      __performanceLogReportInTextFormat(report, nestingLevel + 1)
    )
    .join("")}`;
}

function performanceLogReportInTextFormat(
  report: PerformanceLogReport
): string {
  return __performanceLogReportInTextFormat(report, 0);
}

function reportLogEntry(logEntry: PerformanceLogEntry) {
  process.nextTick(() => {
    try {
      const report = performanceLogReport(logEntry);
      const reportStr = performanceLogReportInTextFormat(report);
      logNow(reportStr);
    } catch (error) {
      logNow(error.message, "error");
    }
  });
}

export const logTimeSync: SyncLogger = IS_DEBUG_MODE
  ? (label, fn) => {
      return (...args) => {
        const currentLogEntry = performanceLogEntry(label, performance.now());
        setActiveLogEntry(currentLogEntry);

        const result = fn(...args);

        currentLogEntry.endTime = performance.now();

        unsetActiveLogEntry();
        if (shouldReportLogStack()) {
          reportLogEntry(currentLogEntry);
        }

        return result;
      };
    }
  : (_label, fn) => fn;

export const logTimeAsync: AsyncLogger = IS_DEBUG_MODE
  ? (label, fn) => {
      return async (...args) => {
        const currentLogEntry = performanceLogEntry(label, performance.now());
        setActiveLogEntry(currentLogEntry);

        const result = await fn(...args);

        currentLogEntry.endTime = performance.now();

        unsetActiveLogEntry();
        if (shouldReportLogStack()) {
          reportLogEntry(currentLogEntry);
        }

        return result;
      };
    }
  : (_label, fn) => fn;
