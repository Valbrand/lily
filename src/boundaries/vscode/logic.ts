import * as vscode from 'vscode'

const supportedLanguageIds = new Set([
  'clojure'
])

export function isDocumentSupported(document: vscode.TextDocument): boolean {
  return supportedLanguageIds.has(document.languageId)
}