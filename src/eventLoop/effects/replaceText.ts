import { TextEditor } from "../../models/textEditor";
import { Position } from "../../models/position";
import { Range } from "../../models/range";

export interface ReplaceTextEffect<RawEditor = any> {
  text: string;
  range?: Range;
  editor: TextEditor<RawEditor>;
  cursorPosition: Position;
}

export function replaceTextEffect(
  editor: TextEditor,
  text: string,
  cursorPosition: Position,
  range?: Range
): ReplaceTextEffect {
  return {
    text,
    editor,
    cursorPosition,
    range,
  };
}
