interface ParinferResult {
  text: string;
  success: boolean;
}

export interface ParinferEngine {
  parenMode(text: string): ParinferResult;
  indentMode(text: string): ParinferResult;
}
