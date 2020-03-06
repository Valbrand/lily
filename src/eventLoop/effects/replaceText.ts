import { TextEditor, EditorPosition, EditorSelection } from "../../textEditor";

export interface ReplaceTextEffect<RawEditor = any> {
  text: string;
  editor: TextEditor<RawEditor>;
  cursorPosition: EditorPosition;
}

export function replaceTextEffect(
  editor: TextEditor,
  text: string,
  cursorPosition: EditorPosition
): ReplaceTextEffect {
  return {
    text,
    editor,
    cursorPosition
  };
}
