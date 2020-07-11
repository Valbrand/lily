export interface Position {
  line: number;
  column: number;
}

export function isBefore(
  aPosition: Position,
  otherPosition: Position
): boolean {
  return (
    aPosition.line < otherPosition.line ||
    (aPosition.line === otherPosition.line &&
      aPosition.column < otherPosition.column)
  );
}

export function isAfter(aPosition: Position, otherPosition: Position): boolean {
  return (
    aPosition.line > otherPosition.line ||
    (aPosition.line === otherPosition.line &&
      aPosition.column > otherPosition.column)
  );
}
