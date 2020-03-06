import * as vscode from "vscode";

const supportedLanguageIds = new Set(["clojure"]);

export function isDocumentSupported(document: vscode.TextDocument): boolean {
  return supportedLanguageIds.has(document.languageId);
}

export function shouldHandleSelectionChangeEvent({
  kind
}: vscode.TextEditorSelectionChangeEvent): boolean {
  return (
    kind === undefined ||
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
