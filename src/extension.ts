// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { createEventRegistry } from './eventLoop/eventLoop'; 

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const { deferDisposal, dispatch, makeEffectHandler } = createEventRegistry(context, {
		test: ({ payload }) => ({ log: payload })
	}, {
		log: (payload: any) => console.log(payload),
	})

	if (vscode.window.activeTextEditor) {
		dispatch('test', `window has an active text editor: ${vscode.window.activeTextEditor.document.fileName}`)
	}

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	deferDisposal(
		vscode.commands.registerCommand('extension.helloWorld', () => {
			// Display a message box to the user
			vscode.window.showWarningMessage('Hello VS Code!');
		})
	);

	// const onTextEditorChangeDisposable = vscode.window.onDidChangeActiveTextEditor(editor => {
	// 	console.log('active text editor changed');
	// })

	deferDisposal(
		vscode.window.onDidChangeTextEditorSelection(evt => {
			dispatch('test', 'text editor selection changed')
		})
	);

	deferDisposal(
		vscode.workspace.onDidChangeTextDocument(evt => {
			dispatch('test', 'text document changed');
		})
	);

  deferDisposal(
		vscode.workspace.onDidOpenTextDocument(textDocument => {
			dispatch('test', 'opened text document')
	
			if (textDocument.languageId === 'clojure') {
				dispatch('test', 'is a clojure document')
			}
		})
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}
