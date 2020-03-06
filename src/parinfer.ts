import { EditorPosition, EditorSelection } from "./textEditor";

export interface ParinferResult {
  text: string;
  success: boolean;
  cursorPosition: EditorPosition;
}

export interface ParinferEngine {
  parenMode(
    text: string,
    cursorPosition: EditorPosition,
    currentSelection: EditorSelection
  ): ParinferResult;
  indentMode(
    text: string,
    cursorPosition: EditorPosition,
    currentSelection: EditorSelection
  ): ParinferResult;
}
