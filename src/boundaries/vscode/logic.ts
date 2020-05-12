import * as vscode from "vscode";
import { every } from "../../utils";

const supportedLanguageIds = new Set(["clojure"]);

export function isDocumentSupported(document: vscode.TextDocument): boolean {
  return supportedLanguageIds.has(document.languageId);
}

export function shouldHandleSelectionChangeEvent({
  kind,
}: vscode.TextEditorSelectionChangeEvent): boolean {
  return (
    kind === vscode.TextEditorSelectionChangeKind.Keyboard ||
    kind === vscode.TextEditorSelectionChangeKind.Mouse
  );
}

function isDeletionDocumentChangeEvent(
  event: vscode.TextDocumentContentChangeEvent
) {
  return event.text.length === 0;
}

export function shouldHandleTextDocumentChangeEvent(
  event: vscode.TextDocumentChangeEvent,
  editor: vscode.TextEditor
): boolean {
  return (
    event.contentChanges.length > 0 &&
    editor.document === event.document &&
    every(isDeletionDocumentChangeEvent)(event.contentChanges)
  );
}
