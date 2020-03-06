declare module "parinfer" {
  function indentMode(
    lispString: string,
    options: ParinferOptions
  ): ParinferResult;
  function parenMode(
    lispString: string,
    options: ParinferOptions
  ): ParinferResult;
  function smartMode(lispString: string): ParinferResult;

  interface ParinferOptions {
    cursorLine?: number;
    cursorX?: number;
    selectionStartLine?: number;
  }

  interface ParinferResult {
    text: string;
    success: boolean;
    cursorX: number;
    cursorLine: number;
    parenTrails: ParenTrail[];
  }

  interface ParenTrail {
    lineNo: number;
    startX: number;
    endX: number;
  }
}
