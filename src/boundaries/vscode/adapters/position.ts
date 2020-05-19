import * as vscode from "vscode";
import { Position } from "../../../models/position";

export function vscodePosition(position: vscode.Position): Position {
  return {
    line: position.line,
    column: position.character,
  };
}
