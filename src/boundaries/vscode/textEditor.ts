import { TextEditor, EditorSelection } from "../../models/textEditor";
import * as vscode from "vscode";
import * as logic from "./logic";
import { Position } from "../../models/position";
import { TextDocument } from "../../models/textDocument";

function memoize<T>(fn: () => T): () => T {
  let memoized: T | undefined;

  return () => {
    if (memoized) return memoized;

    return (memoized = fn());
  };
}

export function vscodeTextEditor(editor: vscode.TextEditor): TextEditor {
  return {
    document: memoize(() => vscodeTextDocument(editor.document)),
    cursorPosition: () => cursorPosition(editor),
    currentSelection: () => currentSelection(editor),

    hasPendingEdit: false,

    _rawEditor: editor,
  };
}

export function vscodeTextDocument(
  document: vscode.TextDocument
): TextDocument {
  return {
    isSupported: () => logic.isDocumentSupported(document),
    fileName: () => document.fileName,
    text: () => document.getText(),
  };
}

function cursorPosition(editor: vscode.TextEditor): Position {
  return positionToEditorPosition(editor.selection.active);
}

function currentSelection(editor: vscode.TextEditor): EditorSelection {
  return {
    start: positionToEditorPosition(editor.selection.start),
    end: positionToEditorPosition(editor.selection.end),
  };
}

function positionToEditorPosition(position: vscode.Position): Position {
  return {
    line: position.line,
    column: position.character,
  };
}
