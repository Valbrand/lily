import { ParinferEngine } from "./parinfer";
import { FeatureFlags } from "./featureFlags";
import { TextEditor } from "./models/textEditor";

export interface EventHandlerContext<T = any> {
  parinferEngine: ParinferEngine;
  featureFlags: FeatureFlags;
  activeTextEditor: TextEditor | undefined;
  payload: T;
}
