export interface TextDocument {
  isSupported(): boolean;
  fileName(): string;
  text(): string;
}

export interface TextEditor<RawEditor = any> {
  document(): TextDocument;

  _rawEditor: RawEditor
}