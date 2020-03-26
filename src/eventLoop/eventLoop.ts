// types

type EffectHandler = (payload: any) => Promise<any>;
type EffectMap = { [effectName: string]: EffectHandler };
export interface EffectExecutionPlan {
  [effectName: string]: any;
}

interface MinimumEventHandlerContext<T = any> {
  payload: T;
}
type EventHandlerContextBuilder<ContextType extends MinimumEventHandlerContext<T>, T = any> = (
  payload: T
) => ContextType;
type EventHandler<ContextType extends MinimumEventHandlerContext<T>, T = any> = (
  context: ContextType
) => EffectExecutionPlan;
type CustomEventHandler<ContextType extends MinimumEventHandlerContext<T>, T = any> =(
  context: ContextType
) => EffectExecutionPlan;
type CustomEventHandlerEntrypoint<T> = (eventPayload: T) => void;
type EventMap<ContextType extends MinimumEventHandlerContext> = { [eventName: string]: EventHandler<ContextType> };

interface EventRegistry<ContextType extends MinimumEventHandlerContext> {
  dispatch(event: string, payload?: any): void;
  makeEffectHandler<T>(
    eventHandler: CustomEventHandler<ContextType>
  ): CustomEventHandlerEntrypoint<T>;
}

// functions

async function runEffectExecutionPlan(
  effectMap: EffectMap,
  executionPlan: EffectExecutionPlan
) {
  Object.entries(executionPlan).forEach(async ([effectName, effectPayload]) => {
    const effectHandler: EffectHandler | undefined = effectMap[effectName];

    if (effectHandler !== undefined) {
      console.log(`Running ${effectName}...`);
      await effectHandler(effectPayload);
    } else {
      console.error(`unrecognized effect ${effectName}`);
    }
  });
}

const dispatchEvent = <ContextType extends MinimumEventHandlerContext>(
  buildContext: EventHandlerContextBuilder<ContextType>,
  eventMap: EventMap<ContextType>,
  effectMap: EffectMap
) => (
  eventName: string,
  payload?: any
) => {
  const handler: EventHandler<ContextType> | undefined = eventMap[eventName];

  if (handler) {
    const effectExecPlan = handler(buildContext(payload));

    runEffectExecutionPlan(effectMap, effectExecPlan);
  }
};

const makeEffectHandler = <ContextType extends MinimumEventHandlerContext>(
  buildContext: EventHandlerContextBuilder<ContextType>,
  effectMap: EffectMap
) => (
  customEventHandler: CustomEventHandler<ContextType>
) => (payload: any) => {
  const effectExecPlan = customEventHandler(buildContext(payload));

  runEffectExecutionPlan(effectMap, effectExecPlan);
};

export function createEventRegistry<ContextType extends MinimumEventHandlerContext>(
  eventMap: EventMap<ContextType>,
  effectMap: EffectMap,
  buildContext: EventHandlerContextBuilder<ContextType>
): EventRegistry<ContextType> {
  return {
    dispatch: dispatchEvent(buildContext, eventMap, effectMap),
    makeEffectHandler: makeEffectHandler(buildContext, effectMap)
  };
}
