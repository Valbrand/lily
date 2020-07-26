import * as vscode from "vscode";
import { Range } from "../../../models/range";
import { vscodePosition, toVscodePosition } from "./position";

export function vscodeRange({ start, end }: vscode.Range): Range {
  return {
    start: vscodePosition(start),
    end: vscodePosition(end),
  };
}

export function toVscodeRange(range: Range): vscode.Range {
  return new vscode.Range(
    toVscodePosition(range.start),
    toVscodePosition(range.end)
  );
}
