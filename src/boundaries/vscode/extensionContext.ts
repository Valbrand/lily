import { createParinferEngine } from "../parinfer";
import { EventHandlerContext } from "../../extensionContext";
import { getFeatureFlags } from "./featureFlags";
import { ExtensionState } from "./state";

export const buildContext = (extensionState: ExtensionState) => <T>(
  payload: T
): EventHandlerContext<T> => {
  return {
    parinferEngine: createParinferEngine(),
    featureFlags: getFeatureFlags(),
    activeTextEditor: extensionState.activeEditor(),
    payload,
  };
};
