// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as handlers from "../../eventHandlers";
import * as logic from "./logic";
import { handleReplaceTextEffectStream } from "./effects/replaceText";
import { handleShowErrorEffectStream } from "./effects/showError";
import { pipe, prop, isDefined, log, constantFn } from "../../utils";
import { initialExtensionState } from "./state";
import { buildContext } from "./extensionContext";
import { VsCodeDriverSource, vsCodeDriver, VsCodeDriver } from "./driver";

import { run } from "@cycle/run";
import xs from "xstream";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const extensionState = initialExtensionState();
  const contextBuilder = buildContext(extensionState);

  const drivers: ExtensionDrivers = {
    vs: vsCodeDriver(
      {
        replaceText: handleReplaceTextEffectStream,
        showError: handleShowErrorEffectStream,
      },
      context
    ),
  };

  function main({ vs }: ExtensionSources) {
    const activeEditor$ = vs
      .onDidChangeActiveTextEditor()
      .debug(log("active text editor"))
      .filter(isDefined)
      .debug(log("filtered active text editor"))
      .map(
        pipe(
          extensionState.editor,
          contextBuilder,
          handlers.handleActiveTextEditorChange
        )
      );

    const textEditorSelection$ = vs
      .onDidChangeTextEditorSelection()
      .debug(log("text editor selection"))
      .filter(logic.shouldHandleSelectionChangeEvent)
      .debug(log("filtered text editor selection"))
      .map(
        pipe(
          prop("textEditor"),
          extensionState.editor,
          contextBuilder,
          handlers.handleSelectionChange
        )
      );

    const textDocumentChange$ = vs
      .onDidChangeTextDocument()
      .debug(log("text document change"))
      .debug()
      .filter(
        (event) =>
          isDefined(vscode.window.activeTextEditor) &&
          logic.shouldHandleTextDocumentChangeEvent(
            event,
            vscode.window.activeTextEditor
          )
      )
      .debug(log("filtered text document change"))
      .map(
        pipe(
          (_event) => extensionState.activeEditor()!,
          contextBuilder,
          handlers.handleTextDocumentChange
        )
      );

    return {
      vs: xs.merge(activeEditor$, textEditorSelection$, textDocumentChange$),
    };
  }

  run(main, drivers);
}

// this method is called when your extension is deactivated
export function deactivate() {}

type ExtensionDrivers = {
  vs: VsCodeDriver;
};

type ExtensionSources = {
  vs: VsCodeDriverSource;
};
