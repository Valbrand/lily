import * as vscode from "vscode";
import { TextEditor } from "../../models/textEditor";
import { vscodeTextEditor } from "./textEditor";

type EditorMap = Map<vscode.TextEditor, TextEditor>;

interface ExtensionState {
  editor(vscodeEditor: vscode.TextEditor): TextEditor;
}

const getEditorFromEditorMap = (editorMap: EditorMap) => (
  vscodeEditor: vscode.TextEditor
): TextEditor => {
  const editorFromMap = editorMap.get(vscodeEditor);
  if (editorFromMap !== undefined) {
    return editorFromMap;
  }

  const editor = vscodeTextEditor(vscodeEditor);
  editorMap.set(vscodeEditor, editor);

  return editor;
};

export function initialExtensionState(): ExtensionState {
  const editorMap: EditorMap = new Map();

  return {
    editor: getEditorFromEditorMap(editorMap)
  };
}
