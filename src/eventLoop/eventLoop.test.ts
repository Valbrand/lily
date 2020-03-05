import * as eventLoop from "./eventLoop";

describe("eventRegistry", () => {
  const eventMap = {
    eventName: jest.fn(context => ({ effectName: "effectPayload" })),
    eventWithUnknownEffects: jest.fn(context => ({
      unknownEffect: "irrelevant"
    })),
    eventWithNoEffects: jest.fn(context => ({}))
  };
  const effectMap = {
    effectName: jest.fn()
  };
  const eventRegistry = eventLoop.createEventRegistry(eventMap, effectMap);

  describe("dispatch", () => {
    test("runs the registered event handler", () => {
      eventRegistry.dispatch("eventName", "eventPayload");

      expect(eventMap.eventName.mock.calls.length).toBe(1);
      expect(eventMap.eventName.mock.calls[0][0]).toEqual(
        expect.objectContaining({ payload: "eventPayload" })
      );
      expect(effectMap.effectName.mock.calls.length).toBe(1);
      expect(effectMap.effectName.mock.calls[0][0]).toBe("effectPayload");
    });

    test("unknown events are ignored", () => {
      eventRegistry.dispatch("unknownEvent");

      expectNoMocksCalled(eventMap);
      expectNoMocksCalled(effectMap);
    });

    test("unknown effects returned by the event handlers are ignored", () => {
      eventRegistry.dispatch("eventWithUnknownEffects");

      expect(eventMap.eventWithUnknownEffects.mock.calls.length).toBe(1);
      expectNoMocksCalled(effectMap);
    });

    test("event handlers that return no effects in the effect map are safely ignored", () => {
      eventRegistry.dispatch("eventWithNoEffects");

      expect(eventMap.eventWithNoEffects.mock.calls.length).toBe(1);
      expectNoMocksCalled(effectMap);
    });
  });

  describe("makeEffectHandler", () => {
    test("runs the effects returned by the provided fn", () => {
      const fn = jest.fn().mockReturnValue({ effectName: "effectPayload" });
      const subject = eventRegistry.makeEffectHandler(fn);

      subject("eventPayload");

      expect(fn.mock.calls.length).toBe(1);
      expect(fn.mock.calls[0][0]).toEqual(
        expect.objectContaining({ payload: "eventPayload" })
      );
      expect(effectMap.effectName.mock.calls.length).toBe(1);
      expect(effectMap.effectName.mock.calls[0][0]).toBe("effectPayload");
    });

    test("unknown effects returned by the provided fn are ignored", () => {
      const fn = jest.fn().mockReturnValue({ unknownEffect: "effectPayload" });
      const subject = eventRegistry.makeEffectHandler(fn);

      subject("eventPayload");

      expect(fn.mock.calls.length).toBe(1);
      expectNoMocksCalled(effectMap);
    });

    test("custom event handlers that return no effects in the effect map are safely ignored", () => {
      const fn = jest.fn().mockReturnValue({});
      const subject = eventRegistry.makeEffectHandler(fn);

      subject("eventPayload");

      expect(fn.mock.calls.length).toBe(1);
      expectNoMocksCalled(effectMap);
    });
  });
});

function expectNoMocksCalled(effectMap: { [effectName: string]: jest.Mock }) {
  Object.values(effectMap).forEach(mockedEffect => {
    expect(mockedEffect.mock.calls.length).toBe(0);
  });
}
