import { EffectExecutionPlan } from "./eventLoop/eventLoop";
import performInitialTreatment from "./controllers/initialTreatment";
import { TextEditor } from "./models/textEditor";
import fixFileChanges from "./controllers/fileChanges";
import { EventHandlerContext } from "./extensionContext";
import fixContentChanges from "./controllers/fixContentChanges";
import { TextDocumentChangeEvent } from "./models/textDocumentChangeEvent";
import { logTimeSync } from "./utils";

export function handleInitialActiveTextEditor({
  activeTextEditor,
  parinferEngine,
}: EventHandlerContext): EffectExecutionPlan {
  return logTimeSync(
    "initial active text editor handler",
    performInitialTreatment
  )(activeTextEditor!, parinferEngine);
}

export function handleActiveTextEditorChange({
  activeTextEditor,
  parinferEngine,
}: EventHandlerContext<TextEditor>): EffectExecutionPlan {
  return logTimeSync(
    "active text editor change handler",
    performInitialTreatment
  )(activeTextEditor!, parinferEngine);
}

export function handleSelectionChange({
  activeTextEditor,
  parinferEngine,
}: EventHandlerContext<TextEditor>): EffectExecutionPlan {
  return logTimeSync("selection change handler", fixFileChanges)(
    activeTextEditor!,
    parinferEngine
  );
}

export function handleTextDocumentChange({
  activeTextEditor,
  parinferEngine,
  payload,
}: EventHandlerContext<TextDocumentChangeEvent>): EffectExecutionPlan {
  return logTimeSync("text document change handler", fixContentChanges)(
    payload,
    activeTextEditor!,
    parinferEngine
  );
}
