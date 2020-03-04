import * as vscode from "vscode";
import { ReplaceTextEffect } from "../../../eventLoop/effects/replaceText";

export function handleReplaceTextEffect(
  effect: ReplaceTextEffect<vscode.TextEditor>
) {
  const vscodeEditor = effect.editor._rawEditor;
  const document = vscodeEditor.document;

  if (effect.text !== document.getText()) {
    vscodeEditor.edit((editBuilder: vscode.TextEditorEdit) => {
      editBuilder.replace(fullFileRange(document), effect.text);
    });
  }
}

function fullFileRange(document: vscode.TextDocument): vscode.Range {
  const startPosition = new vscode.Position(0, 0);
  const endPosition = new vscode.Position(document.lineCount, 0);

  return document.validateRange(new vscode.Range(startPosition, endPosition));
}
