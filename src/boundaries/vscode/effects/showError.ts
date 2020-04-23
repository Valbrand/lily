import { ShowErrorEffect } from "../../../eventLoop/effects/showError";
import * as vscode from "vscode";
import xs, { Stream } from "xstream";

export async function handleShowErrorEffect(effect: ShowErrorEffect) {
  await vscode.window.showErrorMessage(effect.text);
}

export function handleShowErrorEffectStream(effect$: Stream<ShowErrorEffect>) {
  return effect$
    .map((effect) => xs.fromPromise(handleShowErrorEffect(effect)))
    .flatten();
}
