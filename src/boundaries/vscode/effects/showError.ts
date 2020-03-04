import { ShowErrorEffect } from "../../../eventLoop/effects/showError";
import * as vscode from "vscode";

export function handleShowErrorEffect(effect: ShowErrorEffect) {
  vscode.window.showErrorMessage(effect.text);
}
