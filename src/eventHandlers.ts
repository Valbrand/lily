import {
  EventHandlerContext,
  EffectExecutionPlan
} from "./eventLoop/eventLoop";
import performInitialTreatment from "./controllers/initialTreatment";
import { TextEditor } from "./textEditor";
import fixFileChanges from "./controllers/fileChanges";

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
