import parinfer = require("parinfer");
import { ParinferEngine, ParinferResult } from "../../parinfer";
import { EditorSelection } from "../../models/textEditor";
import { Position } from "../../models/position";

function cursorPositionToParinferOptions(
  cursorPosition: Position
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
  cursorPosition: Position,
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
  cursorPosition: Position,
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
