import { TextEditor } from "../../models/textEditor";
import { Position } from "../../models/position";

export interface ReplaceTextEffect<RawEditor = any> {
  text: string;
  editor: TextEditor<RawEditor>;
  cursorPosition: Position;
}

export function replaceTextEffect(
  editor: TextEditor,
  text: string,
  cursorPosition: Position
): ReplaceTextEffect {
  return {
    text,
    editor,
    cursorPosition
  };
}
