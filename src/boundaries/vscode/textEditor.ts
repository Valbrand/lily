import { TextEditor, TextDocument } from '../../textEditor'
import * as vscode from 'vscode'
import * as logic from './logic'

function memoize<T>(fn: () => T): () => T {
  let memoized: T | undefined

  return () => {
    if (memoized) return memoized

    return memoized = fn()
  }
}

function vscodeTextDocument(document: vscode.TextDocument): TextDocument {
  return {
    isSupported: () => logic.isDocumentSupported(document),
    fileName: () => document.fileName,
    text: () => document.getText()
  }
}

export function vscodeTextEditor(editor: vscode.TextEditor): TextEditor {
  return {
    document: memoize(() => vscodeTextDocument(editor.document)),

    _rawEditor: editor
  }
}
