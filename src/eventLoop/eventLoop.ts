import { ParinferEngine } from "../parinfer";
import { createParinferEngine } from "../boundaries/parinfer";

// types

export interface EventHandlerContext<T = any> {
  parinferEngine: ParinferEngine;
  payload: T;
}

type EffectHandler = (payload: any) => Promise<any>;
type EffectMap = { [effectName: string]: EffectHandler };
export interface EffectExecutionPlan {
  [effectName: string]: any;
}

type EventHandler = (context: EventHandlerContext) => EffectExecutionPlan;
type CustomEventHandler<T> = (
  context: EventHandlerContext<T>
) => EffectExecutionPlan;
type CustomEventHandlerEntrypoint<T> = (eventPayload: T) => void;
type EventMap = { [eventName: string]: EventHandler };

interface EventRegistry {
  dispatch(event: string, payload?: any): void;
  makeEffectHandler<T>(
    eventHandler: CustomEventHandler<T>
  ): CustomEventHandlerEntrypoint<T>;
}

// functions

function buildContext<T>(payload: T): EventHandlerContext<T> {
  return {
    parinferEngine: createParinferEngine(),
    payload
  };
}

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

const dispatchEvent = (eventMap: EventMap, effectMap: EffectMap) => (
  eventName: string,
  payload?: any
) => {
  const handler: EventHandler | undefined = eventMap[eventName];

  if (handler) {
    const effectExecPlan = handler(buildContext(payload));

    runEffectExecutionPlan(effectMap, effectExecPlan);
  }
};

const makeEffectHandler = (effectMap: EffectMap) => <T>(
  customEventHandler: CustomEventHandler<T>
) => (payload: T) => {
  const effectExecPlan = customEventHandler(buildContext(payload));

  runEffectExecutionPlan(effectMap, effectExecPlan);
};

export function createEventRegistry(
  eventMap: EventMap,
  effectMap: EffectMap
): EventRegistry {
  return {
    dispatch: dispatchEvent(eventMap, effectMap),
    makeEffectHandler: makeEffectHandler(effectMap)
  };
}
