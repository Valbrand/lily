import * as vscode from 'vscode';

// types

interface EventHandlerContext<T = any> {
  payload?: T;
}

type EffectHandler = (payload: any) => void
type EffectMap = { [effectName: string]: EffectHandler }
interface EffectExecutionPlan {
  [effectName: string]: any
}

type EventHandler = (context: EventHandlerContext) => EffectExecutionPlan;
type CustomEventHandler<T> = (context: EventHandlerContext<T>) => EffectExecutionPlan
type EventMap = { [eventName: string]: EventHandler }

interface EventRegistry {
  dispatch(event: string, payload?: any): void
  makeEffectHandler<T>(eventHandler: CustomEventHandler<T>): void
  deferDisposal(disposable: vscode.Disposable): void
}

// functions

function buildContext<T>(payload?: T): EventHandlerContext<T> {
  if (payload !== undefined) {
    return { payload }
  } else {
    return {}
  }
}

function runEffectExecutionPlan(effectMap: EffectMap, executionPlan: EffectExecutionPlan) {
  Object.entries(executionPlan).forEach(([effectName, effectPayload]) => {
    const effectHandler: EffectHandler | undefined = effectMap[effectName]

    if (effectHandler) {
      effectHandler(effectPayload)
    }
  })
}

const dispatchEvent = (eventMap: EventMap, effectMap: EffectMap) => (eventName: string, payload?: any) => {
  const handler: EventHandler | undefined = eventMap[eventName];

  if (handler) {
    const effectExecPlan = handler(buildContext(payload));

    runEffectExecutionPlan(effectMap, effectExecPlan);
  }
}

const makeEffectHandler = (effectMap: EffectMap) => <T>(customEventHandler: CustomEventHandler<T>) => (payload: T) => {
  const effectExecPlan = customEventHandler(buildContext(payload));

  runEffectExecutionPlan(effectMap, effectExecPlan);
}

const deferDisposal = (context: vscode.ExtensionContext) => (disposable: vscode.Disposable) => {
  context.subscriptions.push(disposable);
}

export function createEventRegistry(context: vscode.ExtensionContext, eventMap: EventMap, effectMap: EffectMap): EventRegistry {
  return {
    dispatch: dispatchEvent(eventMap, effectMap),
    makeEffectHandler: makeEffectHandler(effectMap),
    deferDisposal: deferDisposal(context)
  }
}
