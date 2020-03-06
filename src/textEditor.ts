export interface TextEditor<RawEditor = any> {
  document(): TextDocument;
  cursorPosition(): EditorPosition;
  currentSelection(): EditorSelection;

  hasPendingEdit: boolean;

  _rawEditor: RawEditor;
}

export interface TextDocument {
  isSupported(): boolean;
  fileName(): string;
  text(): string;
}

export interface EditorPosition {
  line: number;
  column: number;
}

export interface EditorSelection {
  start: EditorPosition;
  end: EditorPosition;
}
