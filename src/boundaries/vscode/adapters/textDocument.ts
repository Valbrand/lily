import { TextDocument, TextDocumentLine } from "../../../models/textDocument";
import * as logic from "../logic";

import * as vscode from "vscode";
import { Position } from "../../../models/position";
import { toVscodePosition } from "./position";
import { Range } from "../../../models/range";
import { toVscodeRange } from "./range";

function vscodeTextDocumentLine(line: vscode.TextLine): TextDocumentLine {
  return {
    lineNumber: () => line.lineNumber,
    firstNonWhitespaceCharacterIndex: () =>
      line.firstNonWhitespaceCharacterIndex,
    isEmptyOrWhitespace: () => line.isEmptyOrWhitespace,
    text: () => line.text,
  };
}

export function vscodeTextDocument(
  document: vscode.TextDocument
): TextDocument {
  return {
    isSupported: () => logic.isDocumentSupported(document),
    fileName: () => document.fileName,
    text: () => document.getText(),
    textInRange: (range: Range) => document.getText(toVscodeRange(range)),
    lineNo: (lineNumber: number) =>
      vscodeTextDocumentLine(document.lineAt(lineNumber)),
    lineAt: (position: Position) =>
      vscodeTextDocumentLine(document.lineAt(toVscodePosition(position))),
  };
}
