import {
  EffectExecutionPlan
} from "./eventLoop/eventLoop";
import performInitialTreatment from "./controllers/initialTreatment";
import { TextEditor } from "./models/textEditor";
import fixFileChanges from "./controllers/fileChanges";
import { EventHandlerContext } from "./extensionContext";

export function handleInitialActiveTextEditor({
  payload: editor,
  parinferEngine
}: EventHandlerContext<TextEditor>): EffectExecutionPlan {
  return performInitialTreatment(editor, parinferEngine);
}

export function handleActiveTextEditorChange({
  payload: editor,
  parinferEngine
}: EventHandlerContext<TextEditor>): EffectExecutionPlan {
  return performInitialTreatment(editor, parinferEngine);
}

export function handleSelectionChange({
  payload: editor,
  parinferEngine
}: EventHandlerContext<TextEditor>): EffectExecutionPlan {
  return fixFileChanges(editor, parinferEngine);
}

export function handleTextDocumentChange({
  payload: editor,
  parinferEngine
}: EventHandlerContext<TextEditor>): EffectExecutionPlan {
  return fixFileChanges(editor, parinferEngine);
}
