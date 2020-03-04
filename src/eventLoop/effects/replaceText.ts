import { TextEditor } from '../../textEditor';

export interface ReplaceTextEffect<RawEditor = any> {
  text: string;
  editor: TextEditor<RawEditor>;
}

export function replaceTextEffect(editor: TextEditor, text: string): ReplaceTextEffect {
  return {
    text,
    editor
  }
}