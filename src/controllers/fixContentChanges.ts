import { TextEditor, TextEditorSelection } from "../models/textEditor";
import { ParinferEngine, ParinferResult } from "../parinfer";
import { EffectExecutionPlan } from "../eventLoop/eventLoop";
import { replaceTextEffect } from "../eventLoop/effects/replaceText";
import {
  TextDocumentChangeEvent,
  isDeletionChange,
} from "../models/textDocumentChangeEvent";
import { Position, isAfter } from "../models/position";

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
  const isDeletionFixNecessary = shouldApplyDeletionFix(
    documentChangeEvent,
    editor
  );
  const parinferResult = parinfer.indentMode(
    textBeforeParinfer,
    isDeletionFixNecessary
      ? cursorPositionWithDeletionFix(
          documentChangeEvent,
          editor.cursorPosition()
        )
      : editor.cursorPosition(),
    isDeletionFixNecessary
      ? selectionWithDeletionFix(documentChangeEvent, editor.currentSelection())
      : editor.currentSelection()
  );

  return {
    replaceText: replaceTextEffect(
      editor,
      parinferResult.text,
      parinferResult.cursorPosition
    ),
  };
}

function shouldApplyDeletionFix(
  documentChangeEvent: TextDocumentChangeEvent,
  activeEditor: TextEditor<any>
): boolean {
  return (
    isSingleDeletion(documentChangeEvent) &&
    !isForwardDeletion(documentChangeEvent, activeEditor.cursorPosition())
  );
}

function cursorPositionWithDeletionFix(
  documentChangeEvent: TextDocumentChangeEvent,
  cursorPosition: Position
): Position {
  return {
    line: cursorPosition.line,
    column: cursorPosition.column - documentChangeEvent.changes[0].length,
  };
}

function selectionWithDeletionFix(
  documentChangeEvent: TextDocumentChangeEvent,
  selection: TextEditorSelection
): TextEditorSelection {
  const selectionPosition = {
    line: selection.start.line,
    column: selection.start.column - documentChangeEvent.changes[0].length,
  };

  return {
    start: selectionPosition,
    end: selectionPosition,
  };
}

function isForwardDeletion(
  documentChangeEvent: TextDocumentChangeEvent,
  editorCursorPosition: Position
): boolean {
  const changeEventStartPosition = documentChangeEvent.changes[0].range.start;

  return !isAfter(editorCursorPosition, changeEventStartPosition);
}

function isSingleDeletion(
  documentChangeEvent: TextDocumentChangeEvent
): boolean {
  return (
    documentChangeEvent.changes.length === 1 &&
    isDeletionChange(documentChangeEvent.changes[0])
  );
}
