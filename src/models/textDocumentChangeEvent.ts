import { Range } from "./range";
import { TextDocument } from "./textDocument";

interface TextChange {
  text: string;
  offset: number;
  range: Range;
}

export interface TextDocumentChangeEvent {
  changes: TextChange[];
  document: TextDocument;
}
