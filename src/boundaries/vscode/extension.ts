// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { createEventRegistry } from "../../eventLoop/eventLoop";
import * as handlers from "../../eventHandlers";
import * as logic from "./logic";
import { handleReplaceTextEffect } from "./effects/replaceText";
import { handleShowErrorEffect } from "./effects/showError";
import {
  pipe,
  whenDefined,
  when,
  prop,
  log,
  constantFn,
  logLater
} from "../../utils";
import { initialExtensionState } from "./state";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const { dispatch, makeEffectHandler } = createEventRegistry(
    {
      test: ({ payload }) => ({ log: payload })
    },
    {
      log: async (payload: any) => {
        console.log(payload);
      },
      replaceText: handleReplaceTextEffect,
      showError: handleShowErrorEffect
    }
  );
  const extensionState = initialExtensionState();

  if (vscode.window.activeTextEditor) {
    const handleInitialActiveTextEditor = pipe(
      extensionState.editor,
      makeEffectHandler(handlers.handleInitialActiveTextEditor)
    );

    handleInitialActiveTextEditor(vscode.window.activeTextEditor);
  }

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  deferDisposal(
    context,
    vscode.commands.registerCommand("extension.helloWorld", () => {
      // Display a message box to the user
      vscode.window.showWarningMessage("Hello VS Code!");
    })
  );

  deferDisposal(
    context,
    vscode.window.onDidChangeActiveTextEditor(
      whenDefined(
        pipe(
          extensionState.editor,
          makeEffectHandler(handlers.handleActiveTextEditorChange)
        )
      )
    )
  );

  deferDisposal(
    context,
    vscode.window.onDidChangeTextEditorSelection(
      when(
        pipe(
          log(constantFn("onDidChangeTextEditorSelection")),
          log(),
          logic.shouldHandleSelectionChangeEvent
        ),
        pipe(
          prop("textEditor"),
          log(),
          logLater(constantFn("later from onDidChangeTextEditorSelection")),
          extensionState.editor,
          makeEffectHandler(pipe(handlers.handleSelectionChange, log()))
        )
      )
    )
  );

  deferDisposal(
    context,
    vscode.workspace.onDidChangeTextDocument(
      when(
        event =>
          !!vscode.window.activeTextEditor &&
          logic.shouldHandleTextDocumentChangeEvent(
            event,
            vscode.window.activeTextEditor
          ),
        pipe(
          log(constantFn("onDidChangeTextDocument")),
          log(),
          logLater(constantFn("later from onDidChangeTextDocument")),
          constantFn(vscode.window.activeTextEditor),
          extensionState.editor,
          makeEffectHandler(
            pipe(handlers.handleTextDocumentChange, log(), constantFn({}))
          )
        )
      )
    )
  );

  deferDisposal(
    context,
    vscode.workspace.onDidOpenTextDocument(textDocument => {
      dispatch("test", "opened text document");

      if (textDocument.languageId === "clojure") {
        dispatch("test", "is a clojure document");
      }
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}

const deferDisposal = (
  context: vscode.ExtensionContext,
  disposable: vscode.Disposable
) => {
  context.subscriptions.push(disposable);
};
