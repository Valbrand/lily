import { Range } from "./range";
import { TextDocument } from "./textDocument";

export interface TextDocumentContentChange {
  text: string;
  offset: number;
  range: Range;
  length: number;
}

export interface TextDocumentChangeEvent {
  changes: TextDocumentContentChange[];
  document: TextDocument;
}

export function isDeletionChange(change: TextDocumentContentChange): boolean {
  return change.text.length === 0;
}
