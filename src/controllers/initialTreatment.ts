import { EffectExecutionPlan } from "../eventLoop/eventLoop";
import { replaceTextEffect } from "../eventLoop/effects/replaceText";
import { TextEditor } from "../models/textEditor";
import { showErrorEffect } from "../eventLoop/effects/showError";
import { ParinferEngine } from "../parinfer";

function fixDocumentAlignment(
  editor: TextEditor,
  parinfer: ParinferEngine
): EffectExecutionPlan {
  const document = editor.document();
  const parenRunResult = parinfer.parenMode(
    document.text(),
    editor.cursorPosition(),
    editor.currentSelection()
  );

  return parenRunResult.success
    ? {
        replaceText: replaceTextEffect(
          editor,
          parenRunResult.text,
          parenRunResult.cursorPosition
        )
      }
    : {
        showError: showErrorEffect(
          `Parinfer could not handle the file ${document.fileName()}. It probably has unbalanced parens, please fix the file.`
        )
      };
}

export default function performInitialTreatment(
  editor: TextEditor,
  parinfer: ParinferEngine
): EffectExecutionPlan {
  return editor.document().isSupported()
    ? fixDocumentAlignment(editor, parinfer)
    : {};
}
