import { Position } from "./position";
import { Range } from "./range";

export interface TextDocumentLine {
  lineNumber(): number;
  text(): string;
  firstNonWhitespaceCharacterIndex(): number;
  isEmptyOrWhitespace(): boolean;
}

export interface TextDocument {
  isSupported(): boolean;
  fileName(): string;
  text(): string;
  textInRange(range: Range): string;
  lineNo(line: number): TextDocumentLine;
  lineAt(position: Position): TextDocumentLine;
}
