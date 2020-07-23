import { adapt } from "@cycle/run/lib/adapt";
import { Driver } from "@cycle/run";
import xs, { Stream } from "xstream";
import * as vscode from "vscode";
import { TextEditor } from "../../models/textEditor";
import { ExtensionState } from "./state";
import {
  whenDefined,
  pipe,
  identity,
  log,
  isDefined,
  mapObject,
} from "../../utils";

interface MinimumEventHandlerContext<T> {
  payload: T;
}
type ContextBuilder<
  ContextType extends MinimumEventHandlerContext<T>,
  T = any
> = (payload: T) => ContextType;

type EffectHandler<T> = (payload$: Stream<T>) => Stream<any>;
interface EffectHandlersDefinition {
  [K: string]: EffectHandler<any>;
}
type EffectTriggerStreamMap<EffectMapType extends EffectHandlersDefinition> = {
  [K in keyof EffectMapType]: Stream<Parameters<EffectMapType[K]>>;
};
type EffectExecutionPlan<EffectMapType extends EffectHandlersDefinition> = {
  [K in keyof EffectMapType]?: Parameters<EffectMapType[K]>;
};

export type VsCodeDriver = Driver<Stream<any>, VsCodeDriverSource>;

function effectTriggerStream<T>(effectHandler: EffectHandler<T>): Stream<T> {
  const trigger$ = xs.never();
  effectHandler(trigger$).subscribe({});
  return trigger$;
}

export function vsCodeDriver<EffectMapType extends EffectHandlersDefinition>(
  effectHandlers: EffectMapType,
  vscodeContext: vscode.ExtensionContext
): VsCodeDriver {
  const effectTriggerStreamMap: EffectTriggerStreamMap<EffectMapType> = mapObject<
    EffectMapType,
    EffectHandler<any>,
    Stream<any>
  >(effectHandlers, effectTriggerStream);

  function vsCodeDriverImplementation(
    sink$: Stream<EffectExecutionPlan<EffectMapType>>
  ): VsCodeDriverSource {
    sink$.subscribe({
      next: (effectExecutionPlan) => {
        Object.keys(effectExecutionPlan).forEach(
          <K extends keyof EffectExecutionPlan<EffectMapType>>(key: K) => {
            const effectPayload = effectExecutionPlan[key] as Parameters<
              EffectMapType[K]
            >;
            effectTriggerStreamMap[key].shamefullySendNext(effectPayload);
          }
        );
      },
    });

    return new VsCodeDriverSource(vscodeContext);
  }

  return vsCodeDriverImplementation;
}

export class VsCodeDriverSource {
  constructor(private vscodeContext: vscode.ExtensionContext) {}

  public onDidChangeActiveTextEditor(): Stream<vscode.TextEditor | undefined> {
    const activeEditor$ = xs.create<vscode.TextEditor | undefined>({
      start: (producer) => {
        producer.next(vscode.window.activeTextEditor);

        deferDisposal(
          this.vscodeContext,
          vscode.window.onDidChangeActiveTextEditor(
            (editor: vscode.TextEditor | undefined) => {
              producer.next(editor);
            }
          )
        );
      },
      stop: () => {},
    });

    return adapt(activeEditor$);
  }

  public onDidChangeTextEditorSelection(): Stream<
    vscode.TextEditorSelectionChangeEvent
  > {
    const textEditorSelection$ = xs.create<
      vscode.TextEditorSelectionChangeEvent
    >({
      start: (producer) => {
        deferDisposal(
          this.vscodeContext,
          vscode.window.onDidChangeTextEditorSelection(
            (event: vscode.TextEditorSelectionChangeEvent) => {
              producer.next(event);
            }
          )
        );
      },
      stop: () => {},
    });

    return adapt(textEditorSelection$);
  }

  public onDidChangeTextDocument(): Stream<vscode.TextDocumentChangeEvent> {
    const textDocumentChange$ = xs.create<vscode.TextDocumentChangeEvent>({
      start: (producer) => {
        deferDisposal(
          this.vscodeContext,
          vscode.workspace.onDidChangeTextDocument(
            (event: vscode.TextDocumentChangeEvent) => {
              producer.next(event);
            }
          )
        );
      },
      stop: () => {},
    });

    return adapt(textDocumentChange$);
  }
}

const deferDisposal = (
  context: vscode.ExtensionContext,
  disposable: vscode.Disposable
) => {
  context.subscriptions.push(disposable);
};
