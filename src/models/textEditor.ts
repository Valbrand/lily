import { Position } from "./position";
import { TextDocument } from "./textDocument";

export interface TextEditor<RawEditor = any> {
  document(): TextDocument;
  cursorPosition(): Position;
  currentSelection(): EditorSelection;

  // This attribute makes us unable to simply recreate TextEditor instances at will as it makes TextEditors stateful.
  // Used in the edit lock for files
  hasPendingEdit: boolean;

  _rawEditor: RawEditor;
}

export interface EditorSelection {
  start: Position;
  end: Position;
}
