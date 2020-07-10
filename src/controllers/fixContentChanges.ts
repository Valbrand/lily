import { TextEditor, TextEditorSelection } from "../models/textEditor";
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
    cursorPositionWithDeletionFix(documentChangeEvent, editor.cursorPosition()),
    selectionWithDeletionFix(documentChangeEvent, editor.currentSelection())
  );

  return {
    replaceText: replaceTextEffect(
      editor,
      parinferResult.text,
      parinferResult.cursorPosition
    ),
  };
}

function cursorPositionWithDeletionFix(
  documentChangeEvent: TextDocumentChangeEvent,
  cursorPosition: Position
): Position {
  if (isSingleDeletion(documentChangeEvent)) {
    return {
      line: cursorPosition.line,
      column: cursorPosition.column - documentChangeEvent.changes[0].length,
    };
  }

  return cursorPosition;
}

function selectionWithDeletionFix(
  documentChangeEvent: TextDocumentChangeEvent,
  selection: TextEditorSelection
): TextEditorSelection {
  if (isSingleDeletion(documentChangeEvent)) {
    const selectionPosition = {
      line: selection.start.line,
      column: selection.start.column - documentChangeEvent.changes[0].length,
    };

    return {
      start: selectionPosition,
      end: selectionPosition,
    };
  }

  return selection;
}

function isSingleDeletion(
  documentChangeEvent: TextDocumentChangeEvent
): boolean {
  return (
    documentChangeEvent.changes.length === 1 &&
    isDeletionChange(documentChangeEvent.changes[0])
  );
}
