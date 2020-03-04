import {
  EventHandlerContext,
  EffectExecutionPlan
} from "./eventLoop/eventLoop";
import performInitialTreatment from "./controllers/initialTreatment";
import { TextEditor } from "./textEditor";

export function handleInitialActiveTextEditor({
  payload: editor,
  parinferEngine
}: EventHandlerContext<TextEditor>): EffectExecutionPlan {
  return performInitialTreatment(editor, parinferEngine);
}
