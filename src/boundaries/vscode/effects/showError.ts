import { ShowErrorEffect } from "../../../eventLoop/effects/showError";
import * as vscode from "vscode";

export async function handleShowErrorEffect(effect: ShowErrorEffect) {
  await vscode.window.showErrorMessage(effect.text);
}
