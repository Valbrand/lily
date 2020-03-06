import parinfer = require("parinfer");
import { ParinferEngine, ParinferResult } from "../../parinfer";
import { EditorPosition, EditorSelection } from "../../textEditor";

function cursorPositionToParinferOptions(
  cursorPosition: EditorPosition
): Partial<parinfer.ParinferOptions> {
  return {
    cursorLine: cursorPosition.line,
    cursorX: cursorPosition.column
  };
}

function editorSelectionToParinferOptions(
  selection: EditorSelection
): Partial<parinfer.ParinferOptions> {
  return { selectionStartLine: selection.start.line };
}

function indentMode(
  text: string,
  cursorPosition: EditorPosition,
  selection?: EditorSelection
): ParinferResult {
  const parinferResult = parinfer.indentMode(text, {
    ...cursorPositionToParinferOptions(cursorPosition),
    ...(selection ? editorSelectionToParinferOptions(selection) : {})
  });

  return {
    text: parinferResult.text,
    success: parinferResult.success,
    cursorPosition: {
      line: parinferResult.cursorLine,
      column: parinferResult.cursorX
    }
  };
}

function parenMode(
  text: string,
  cursorPosition: EditorPosition,
  selection?: EditorSelection
): ParinferResult {
  const parinferResult = parinfer.parenMode(text, {
    ...cursorPositionToParinferOptions(cursorPosition),
    ...(selection ? editorSelectionToParinferOptions(selection) : {})
  });

  return {
    text: parinferResult.text,
    success: parinferResult.success,
    cursorPosition: {
      line: parinferResult.cursorLine,
      column: parinferResult.cursorX
    }
  };
}

export function createParinferEngine(): ParinferEngine {
  return {
    indentMode,
    parenMode
  };
}
