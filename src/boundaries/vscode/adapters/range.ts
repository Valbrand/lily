import * as vscode from "vscode";
import { Range } from "../../../models/range";
import { vscodePosition } from "./position";

export function vscodeRange({ start, end }: vscode.Range): Range {
  return {
    start: vscodePosition(start),
    end: vscodePosition(end),
  };
}
