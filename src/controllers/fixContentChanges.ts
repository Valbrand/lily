import { TextEditor } from "../models/textEditor";
import { ParinferEngine, ParinferResult } from "../parinfer";
import { EffectExecutionPlan } from "../eventLoop/eventLoop";
import { replaceTextEffect } from "../eventLoop/effects/replaceText";
import {
  TextDocumentChangeEvent,
  isDeletionChange,
} from "../models/textDocumentChangeEvent";
import { Position } from "../models/position";

export default function fixContentChanges(
  documentChangeEvent: TextDocumentChangeEvent,
  editor: TextEditor,
  parinfer: ParinferEngine
): EffectExecutionPlan {
  if (editor.document().isSupported()) {
    return indentModeEffect(documentChangeEvent, editor, parinfer);
  } else {
    return {};
  }
}

function indentModeEffect(
  documentChangeEvent: TextDocumentChangeEvent,
  editor: TextEditor<any>,
  parinfer: ParinferEngine
) {
  const textBeforeParinfer = editor.document().text();
  const parinferResult = parinfer.indentMode(
    textBeforeParinfer,
    editor.cursorPosition(),
    editor.currentSelection()
  );

  return {
    replaceText: replaceTextEffect(
      editor,
      parinferResult.text,
      newCursorPosition(documentChangeEvent, parinferResult)
    ),
  };
}

function newCursorPosition(
  documentChangeEvent: TextDocumentChangeEvent,
  parinferResult: ParinferResult
): Position {
  if (isSingleDeletion(documentChangeEvent)) {
    return {
      line: parinferResult.cursorPosition.line,
      column:
        parinferResult.cursorPosition.column -
        documentChangeEvent.changes[0].length,
    };
  }

  return parinferResult.cursorPosition;
}

function isSingleDeletion(
  documentChangeEvent: TextDocumentChangeEvent
): boolean {
  return (
    documentChangeEvent.changes.length === 1 &&
    isDeletionChange(documentChangeEvent.changes[0])
  );
}
