import { TextEditorSelection } from "./models/textEditor";
import { Position } from "./models/position";

export interface ParinferResult {
  text: string;
  success: boolean;
  cursorPosition: Position;
}

export interface ParinferEngine {
  parenMode(
    text: string,
    cursorPosition: Position,
    currentSelection: TextEditorSelection
  ): ParinferResult;
  indentMode(
    text: string,
    cursorPosition: Position,
    currentSelection: TextEditorSelection
  ): ParinferResult;
}
