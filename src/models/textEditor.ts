import { Position } from "./position";
import { TextDocument } from "./textDocument";

export interface TextEditor<RawEditor = any> {
  document(): TextDocument;
  cursorPosition(): Position;
  currentSelection(): TextEditorSelection;


  _rawEditor: RawEditor;
}

export interface TextEditorSelection {
  start: Position;
  end: Position;
}
