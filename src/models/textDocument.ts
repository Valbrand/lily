import { Position } from "./position";

export interface TextDocument {
  isSupported(): boolean;
  fileName(): string;
  text(): string;
}

export interface TextDocumentChangeEvent {
  document(): TextDocument;
  start(): Position;
  end(): Position;
  length: number;
  text: string;
}
