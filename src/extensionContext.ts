import { ParinferEngine } from "./parinfer";
import { FeatureFlags } from "./featureFlags";

export interface EventHandlerContext<T = any> {
    parinferEngine: ParinferEngine;
    featureFlags: FeatureFlags;
    payload: T;
}