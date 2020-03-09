import * as vscode from "vscode";
import { TextDocumentChangeEvent } from "../../models/textDocument";
import { memoizeUnary } from "../../utils";
import { vscodeTextDocument } from "./textEditor";

const supportedLanguageIds = new Set(["clojure"]);

export function isDocumentSupported(document: vscode.TextDocument): boolean {
  return supportedLanguageIds.has(document.languageId);
}

export function shouldHandleSelectionChangeEvent({
  kind
}: vscode.TextEditorSelectionChangeEvent): boolean {
  return (
    kind === vscode.TextEditorSelectionChangeKind.Keyboard ||
    kind === vscode.TextEditorSelectionChangeKind.Mouse
  );
}

export function shouldHandleTextDocumentChangeEvent(
  event: vscode.TextDocumentChangeEvent,
  editor: vscode.TextEditor
): boolean {
  return event.contentChanges.length > 0 && editor.document === event.document;
}

export function textDocumentEvent(
  editor: vscode.TextEditor,
  event: vscode.TextDocumentChangeEvent
): TextDocumentChangeEvent {
  return {
    document: memoizeUnary(() => vscodeTextDocument(event.document)),
    length
  };
}
