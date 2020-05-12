import {
  TextDocumentChangeEvent,
  TextDocumentContentChange,
} from "../../../models/textDocumentChangeEvent";
import * as vscode from "vscode";
import { vscodeTextDocument } from "../textEditor";
import { vscodeRange } from "./range";

export function vscodeTextDocumentChangeEvent(
  event: vscode.TextDocumentChangeEvent
): TextDocumentChangeEvent {
  return {
    document: vscodeTextDocument(event.document),
    changes: event.contentChanges.map(vscodeTextDocumentChange),
  };
}

function vscodeTextDocumentChange(
  change: vscode.TextDocumentContentChangeEvent
): TextDocumentContentChange {
  return {
    text: change.text,
    offset: change.rangeOffset,
    range: vscodeRange(change.range),
    length: change.rangeLength,
  };
}
