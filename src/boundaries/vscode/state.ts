import * as vscode from "vscode";
import { TextEditor } from "../../models/textEditor";
import { vscodeTextEditor } from "./textEditor";
import { whenDefined } from "../../utils";

type EditorMap = Map<vscode.TextEditor, TextEditor>;

export interface ExtensionState {
  editor(vscodeEditor: vscode.TextEditor): TextEditor;
  activeEditor(): TextEditor | undefined;
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
  const editorGetter = getEditorFromEditorMap(editorMap);

  return {
    editor: editorGetter,
    activeEditor: () =>
      whenDefined(editorGetter)(vscode.window.activeTextEditor),
  };
}
