import * as vscode from "vscode";
import { TextEditor, TextEditorSelection } from "../../../models/textEditor";
import { vscodeTextDocument } from "./textDocument";
import { Position } from "../../../models/position";
import { vscodePosition } from "./position";

export function vscodeTextEditor(editor: vscode.TextEditor): TextEditor {
  return {
    document: () => vscodeTextDocument(editor.document),
    cursorPosition: () => cursorPosition(editor),
    currentSelection: () => currentSelection(editor),

    _rawEditor: editor,
  };
}

function cursorPosition(editor: vscode.TextEditor): Position {
  return vscodePosition(editor.selection.active);
}

function currentSelection(editor: vscode.TextEditor): TextEditorSelection {
  return {
    start: vscodePosition(editor.selection.start),
    end: vscodePosition(editor.selection.end),
  };
}
