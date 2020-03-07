import * as vscode from "vscode";
import { ReplaceTextEffect } from "../../../eventLoop/effects/replaceText";
import { Position } from "../../../models/position";

export async function handleReplaceTextEffect(
  effect: ReplaceTextEffect<vscode.TextEditor>
) {
  const vscodeEditor = effect.editor._rawEditor;
  const document = vscodeEditor.document;

  if (shouldPerformEdit(effect)) {
    effect.editor.hasPendingEdit = true;
    await vscodeEditor
      .edit((editBuilder: vscode.TextEditorEdit) => {
        editBuilder.replace(fullFileRange(document), effect.text);
      })
      .then(() => {
        if (vscodeEditor.selection.isEmpty) {
          vscodeEditor.selection = emptySelection(effect.cursorPosition);
        }
      });
    effect.editor.hasPendingEdit = false;
  } else {
    console.warn(
      effect.editor.hasPendingEdit
        ? `ReplaceTextEffect discarded because editor has pending edits`
        : `ReplaceTextEffect discarded because no changes were detected`
    );
  }
}

function shouldPerformEdit({ editor, text }: ReplaceTextEffect): boolean {
  return !editor.hasPendingEdit && text !== editor.document().text();
}

function fullFileRange(document: vscode.TextDocument): vscode.Range {
  const startPosition = new vscode.Position(0, 0);
  const endPosition = new vscode.Position(document.lineCount, 0);

  return document.validateRange(new vscode.Range(startPosition, endPosition));
}

function emptySelection(cursorPosition: Position): vscode.Selection {
  const newCursorPosition = editorPositionToPosition(cursorPosition);

  return new vscode.Selection(newCursorPosition, newCursorPosition);
}

function editorPositionToPosition(editorPosition: Position): vscode.Position {
  return new vscode.Position(editorPosition.line, editorPosition.column);
}
