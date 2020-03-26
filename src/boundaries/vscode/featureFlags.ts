import { FeatureFlags } from "../../featureFlags";
import * as vscode from 'vscode'

const defaultFeatureFlags: FeatureFlags = {
    bleedingEdge: false
}

export function getFeatureFlags(): FeatureFlags {
    return {
        ...defaultFeatureFlags,
        ...vscode.workspace.getConfiguration('lily').get<FeatureFlags>('featureFlags')
    };
}