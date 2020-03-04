declare module 'parinfer' {
  function indentMode(lispString: string): ParinferResult
  function parenMode(lispString: string): ParinferResult
  function smartMode(lispString: string): ParinferResult

  interface ParinferResult {
    text: string;
    success: boolean;
    parenTrails: ParenTrail[];
  }

  interface ParenTrail {
    lineNo: number;
    startX: number;
    endX: number;
  }
}
