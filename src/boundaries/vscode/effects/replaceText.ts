import * as vscode from "vscode";
import { ReplaceTextEffect } from "../../../eventLoop/effects/replaceText";
import { Position } from "../../../models/position";
import xs, { Stream } from "xstream";
import sampleCombine from "xstream/extra/sampleCombine";
import dropRepeats from "xstream/extra/dropRepeats";
import { logTimeAsync } from "../../../utils";
import { toVscodeRange } from "../adapters/range";

const replaceTextFinishedEventEmitter = new vscode.EventEmitter<{}>();

export async function handleReplaceTextEffect(
  effect: ReplaceTextEffect<vscode.TextEditor>
) {
  const vscodeEditor = effect.editor._rawEditor;
  const document = vscodeEditor.document;

  if (shouldPerformEdit(effect)) {
    await vscodeEditor
      .edit((editBuilder: vscode.TextEditorEdit) => {
        const range = !!effect.range
          ? toVscodeRange(effect.range)
          : fullFileRange(document);
        editBuilder.replace(range, effect.text);
      })
      .then(() => {
        if (vscodeEditor.selection.isEmpty) {
          vscodeEditor.selection = emptySelection(effect.cursorPosition);
        }
      });
  }
}

function shouldPerformEdit({ editor, text }: ReplaceTextEffect): boolean {
  return text !== editor.document().text();
}

function fullFileRange(document: vscode.TextDocument): vscode.Range {
  const startPosition = new vscode.Position(0, 0);
  const endPosition = new vscode.Position(document.lineCount, 0);

  return document.validateRange(new vscode.Range(startPosition, endPosition));
}

function emptySelection(cursorPosition: Position): vscode.Selection {
  const newCursorPosition = editorPositionToPosition(cursorPosition);

  return new vscode.Selection(newCursorPosition, newCursorPosition);
}

function editorPositionToPosition(editorPosition: Position): vscode.Position {
  return new vscode.Position(editorPosition.line, editorPosition.column);
}

export function handleReplaceTextEffectStream(
  effect$: Stream<ReplaceTextEffect<vscode.TextEditor>>
): Stream<any> {
  return effect$
    .compose(preventConcurrency)
    .map((effect) =>
      xs.fromPromise(
        logTimeAsync("replaceText", async (effect) => {
          await handleReplaceTextEffect(effect);

          replaceTextFinishedEventEmitter.fire();
        })(effect)
      )
    )
    .flatten();
}

function preventConcurrency(
  effect$: Stream<ReplaceTextEffect<vscode.TextEditor>>
): Stream<ReplaceTextEffect<vscode.TextEditor>> {
  return effect$
    .compose(sampleCombine(replaceTextFinished$))
    .compose(
      dropRepeats(([_fx1, control1], [_fx2, control2]) => control1 === control2)
    )
    .map(([effect]) => effect);
}

const replaceTextFinished$ = xs
  .create({
    start: (producer) => {
      replaceTextFinishedEventEmitter.event((_event) => {
        producer.next({});
      });
    },
    stop: () => {},
  })
  .fold((acc, _) => acc + 1, 0);
