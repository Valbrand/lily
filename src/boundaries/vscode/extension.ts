import * as vscode from "vscode";
import * as handlers from "../../eventHandlers";
import * as logic from "./logic";
import {
  handleReplaceTextEffectStream,
  handleReplaceTextEffect,
} from "./effects/replaceText";
import {
  handleShowErrorEffectStream,
  handleShowErrorEffect,
} from "./effects/showError";
import { pipe, prop, isDefined, logTimeSync, logTimeAsync } from "../../utils";
import { initialExtensionState } from "./state";
import { buildContext } from "./extensionContext";
import {
  VsCodeDriverSource,
  vsCodeDriver,
  VsCodeDriver,
  VsCodeCommandOrder,
} from "./driver";

import { run } from "@cycle/run";
import xs from "xstream";
import { vscodeTextDocumentChangeEvent } from "./adapters/textDocumentChangeEvent";
import { EffectExecutionPlan } from "../../eventLoop/eventLoop";

export function activate(context: vscode.ExtensionContext) {
  const extensionState = initialExtensionState();
  const contextBuilder = buildContext(extensionState);

  const drivers: ExtensionDrivers = {
    vs: vsCodeDriver(
      {
        replaceText: logTimeAsync(
          "replace text command",
          handleReplaceTextEffect
        ),
        showError: handleShowErrorEffect,
      },
      {},
      context
    ),
  };

  function main({ vs }: ExtensionSources) {
    const activeEditor$ = vs
      .onDidChangeActiveTextEditor()
      .filter(isDefined)
      .map(
        logTimeSync(
          "active text editor stream",
          pipe(
            extensionState.editor,
            contextBuilder,
            handlers.handleActiveTextEditorChange
          )
        )
      )
      .map(pipe(effectExecutionPlanToVsCodeCommand, xs.fromArray))
      .flatten();

    const textEditorSelection$ = vs
      .onDidChangeTextEditorSelection()
      .filter(logic.shouldHandleSelectionChangeEvent)
      .map(
        logTimeSync(
          "text editor selection change stream",
          pipe(
            prop("textEditor"),
            extensionState.editor,
            contextBuilder,
            handlers.handleSelectionChange
          )
        )
      )
      .map(pipe(effectExecutionPlanToVsCodeCommand, xs.fromArray))
      .flatten();

    const textDocumentChange$ = vs
      .onDidChangeTextDocument()
      .filter(
        (event) =>
          isDefined(vscode.window.activeTextEditor) &&
          logic.shouldHandleTextDocumentChangeEvent(
            event,
            vscode.window.activeTextEditor
          )
      )
      .map(
        logTimeSync(
          "text document change stream",
          pipe(
            vscodeTextDocumentChangeEvent,
            contextBuilder,
            handlers.handleTextDocumentChange
          )
        )
      )
      .map(pipe(effectExecutionPlanToVsCodeCommand, xs.fromArray))
      .flatten();

    return {
      vs: xs.merge(activeEditor$, textEditorSelection$, textDocumentChange$),
    };
  }

  run(main, drivers);
}

function effectExecutionPlanToVsCodeCommand(
  effectPlan: EffectExecutionPlan
): VsCodeCommandOrder[] {
  return Object.keys(effectPlan).map((effectName) => [
    effectName,
    effectPlan[effectName],
  ]);
}

export function deactivate() {}

type ExtensionDrivers = {
  vs: VsCodeDriver;
};

type ExtensionSources = {
  vs: VsCodeDriverSource;
};
