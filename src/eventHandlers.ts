import { EffectExecutionPlan } from "./eventLoop/eventLoop";
import performInitialTreatment from "./controllers/initialTreatment";
import { TextEditor } from "./models/textEditor";
import fixFileChanges from "./controllers/fileChanges";
import { EventHandlerContext } from "./extensionContext";

export function handleInitialActiveTextEditor({
  activeTextEditor,
  parinferEngine,
}: EventHandlerContext): EffectExecutionPlan {
  return performInitialTreatment(activeTextEditor!, parinferEngine);
}

export function handleActiveTextEditorChange({
  activeTextEditor,
  parinferEngine,
}: EventHandlerContext<TextEditor>): EffectExecutionPlan {
  return performInitialTreatment(activeTextEditor!, parinferEngine);
}

export function handleSelectionChange({
  activeTextEditor,
  parinferEngine,
}: EventHandlerContext<TextEditor>): EffectExecutionPlan {
  return fixFileChanges(activeTextEditor!, parinferEngine);
}

export function handleTextDocumentChange({
  activeTextEditor,
  parinferEngine,
}: EventHandlerContext<TextEditor>): EffectExecutionPlan {
  return fixFileChanges(activeTextEditor!, parinferEngine);
}
