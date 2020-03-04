export interface ShowErrorEffect {
  text: string;
}

export function showErrorEffect(text: string): ShowErrorEffect {
  return {
    text
  };
}
