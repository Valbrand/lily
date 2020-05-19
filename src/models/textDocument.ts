import { Position } from "./position";

export interface TextDocument {
  isSupported(): boolean;
  fileName(): string;
  text(): string;
}
