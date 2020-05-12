import { TextDocument } from "../../../models/textDocument";
import * as logic from "../logic";

import * as vscode from "vscode";

export function vscodeTextDocument(
  document: vscode.TextDocument
): TextDocument {
  return {
    isSupported: () => logic.isDocumentSupported(document),
    fileName: () => document.fileName,
    text: () => document.getText(),
  };
}
