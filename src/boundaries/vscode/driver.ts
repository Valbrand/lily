import { adapt } from "@cycle/run/lib/adapt";
import { Driver } from "@cycle/run";
import xs, { Stream } from "xstream";
import * as vscode from "vscode";
import { TextEditor } from "../../models/textEditor";
import { ExtensionState } from "./state";
import { whenDefined, pipe, identity, log, isDefined } from "../../utils";

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
type EffectExecutionStreamMap<
  EffectMapType extends EffectHandlersDefinition
> = {
  [K in keyof EffectMapType]: Stream<Parameters<EffectMapType[K]>>;
};
type EffectExecutionPlan<EffectMapType extends EffectHandlersDefinition> = {
  [K in keyof EffectMapType]?: Parameters<EffectMapType[K]>;
};

export type VsCodeDriver = Driver<Stream<any>, VsCodeDriverSource>;

export function vsCodeDriver<EffectMapType extends EffectHandlersDefinition>(
  effectHandlers: EffectMapType,
  vscodeContext: vscode.ExtensionContext
): VsCodeDriver {
  function vsCodeDriverImplementation(
    sink$: Stream<EffectExecutionPlan<EffectMapType>>
  ): VsCodeDriverSource {
    sink$
      .map((effectExecutionPlan) => {
        return xs
          .from(
            Object.keys(effectExecutionPlan).map(
              (effectType: keyof EffectMapType) => {
                return effectHandlers[effectType](
                  xs.of(effectExecutionPlan[effectType])
                );
              }
            )
          )
          .flatten();
      })
      .flatten()
      .subscribe({});

    return new VsCodeDriverSource(vscodeContext);
  }

  return vsCodeDriverImplementation;
}

export class VsCodeDriverSource {
  constructor(private vscodeContext: vscode.ExtensionContext) {}

  public onDidChangeActiveTextEditor(): Stream<vscode.TextEditor> {
    const activeEditor$ = xs.create<vscode.TextEditor>({
      start: (producer) => {
        if (!!vscode.window.activeTextEditor) {
          producer.next(vscode.window.activeTextEditor);
        }

        deferDisposal(
          this.vscodeContext,
          vscode.window.onDidChangeActiveTextEditor(
            whenDefined((editor: vscode.TextEditor) => producer.next(editor))
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
            (event: vscode.TextEditorSelectionChangeEvent) =>
              producer.next(event)
          )
        );
      },
      stop: () => {},
    });

    return adapt(textEditorSelection$);
  }

  public onDidChangeTextDocument(): Stream<any> {
    const textDocumentChange$ = xs.create<vscode.TextDocumentChangeEvent>({
      start: (producer) => {
        deferDisposal(
          this.vscodeContext,
          vscode.workspace.onDidChangeTextDocument(
            (event: vscode.TextDocumentChangeEvent) => producer.next(event)
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
