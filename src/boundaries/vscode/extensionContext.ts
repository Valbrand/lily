import { createParinferEngine } from "../parinfer";
import { EventHandlerContext } from "../../extensionContext";
import { getFeatureFlags } from "./featureFlags";

export function buildContext<T>(payload: T): EventHandlerContext<T> {
    return {
      parinferEngine: createParinferEngine(),
      featureFlags: getFeatureFlags(),
      payload
    };
}