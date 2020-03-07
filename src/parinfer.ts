import { EditorSelection } from "./textEditor";
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
    currentSelection: EditorSelection
  ): ParinferResult;
  indentMode(
    text: string,
    cursorPosition: Position,
    currentSelection: EditorSelection
  ): ParinferResult;
}
