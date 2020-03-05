export function mockObject<T extends object>(
  methodOverrides: Partial<T> = {}
): T {
  const handler: ProxyHandler<T> = {
    get(_target: T, prop: PropertyKey, _receiver: any): any {
      const propFromOverride = methodOverrides[prop as keyof T];
      if (propFromOverride !== undefined) {
        return propFromOverride;
      }

      switch (prop) {
        case "asymmetricMatch":
        case Symbol.iterator:
          return undefined;
        default:
          throw new Error(
            `Property ${String(prop)} was accessed, but not mocked!`
          );
      }
    }
  };

  return new Proxy<T>({} as T, handler);
}
