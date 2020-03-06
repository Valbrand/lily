import { TextEditor } from "../textEditor";
import { ParinferEngine } from "../parinfer";
import { EffectExecutionPlan } from "../eventLoop/eventLoop";
import { replaceTextEffect } from "../eventLoop/effects/replaceText";

export default function fixFileChanges(
  editor: TextEditor,
  parinfer: ParinferEngine
): EffectExecutionPlan {
  if (editor.document().isSupported()) {
    return applyIndentMode(editor, parinfer);
  } else {
    return {};
  }
}

function applyIndentMode(editor: TextEditor<any>, parinfer: ParinferEngine) {
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
      parinferResult.cursorPosition
    )
  };
}
