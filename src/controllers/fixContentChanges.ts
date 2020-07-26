import { TextEditor, TextEditorSelection } from "../models/textEditor";
import { ParinferEngine, ParinferResult } from "../parinfer";
import { EffectExecutionPlan } from "../eventLoop/eventLoop";
import { replaceTextEffect } from "../eventLoop/effects/replaceText";
import {
  TextDocumentChangeEvent,
  isDeletionChange,
} from "../models/textDocumentChangeEvent";
import { Position, isAfter } from "../models/position";
import { TextDocument } from "../models/textDocument";
import { logNow, logTimeSync } from "../utils";

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
  const textRange = logTimeSync(
    "top level expression range",
    topLevelExpressionRange
  )(documentChangeEvent.document, editor.cursorPosition());
  const textBeforeParinfer = editor.document().textInRange(textRange);
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
      parinferResult.cursorPosition,
      textRange
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

// range experiments
// We are always assuming below that top level expressions start at indentation level 0

function topLevelExpressionStartingPosition(
  document: TextDocument,
  cursorPosition: Position
): Position {
  let lineNumberBeingChecked = cursorPosition.line;

  while (
    lineNumberBeingChecked > 0 &&
    document
      .lineNo(lineNumberBeingChecked)
      .firstNonWhitespaceCharacterIndex() !== 0
  ) {
    lineNumberBeingChecked--;
  }

  return { line: lineNumberBeingChecked, column: 0 };
}

function topLevelExpressionEndPosition(
  document: TextDocument,
  cursorPosition: Position
): Position {
  let lineNumberBeingChecked = cursorPosition.line + 1;

  while (
    document
      .lineNo(lineNumberBeingChecked)
      .firstNonWhitespaceCharacterIndex() !== 0
  ) {
    lineNumberBeingChecked++;
  }
  lineNumberBeingChecked--;

  return {
    line: lineNumberBeingChecked,
    column: document.lineNo(lineNumberBeingChecked).text().length,
  };
}

function topLevelExpressionRange(
  document: TextDocument,
  cursorPosition: Position
) {
  const startingPosition = topLevelExpressionStartingPosition(
    document,
    cursorPosition
  );
  const endPosition = topLevelExpressionEndPosition(document, cursorPosition);

  return { start: startingPosition, end: endPosition };
}
