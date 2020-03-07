import { Position } from "./models/position";

export interface TextEditor<RawEditor = any> {
  document(): TextDocument;
  cursorPosition(): Position;
  currentSelection(): EditorSelection;

  hasPendingEdit: boolean;

  _rawEditor: RawEditor;
}

export interface TextDocument {
  isSupported(): boolean;
  fileName(): string;
  text(): string;
}

export interface EditorSelection {
  start: Position;
  end: Position;
}
