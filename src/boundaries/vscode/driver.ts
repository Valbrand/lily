import { adapt } from "@cycle/run/lib/adapt";
import { Driver } from "@cycle/run";
import xs, { Stream } from "xstream";
import * as vscode from "vscode";
import { TextEditor } from "../../models/textEditor";
import { ExtensionState } from "./state";
import {
  whenDefined,
  pipe,
  identity,
  log,
  isDefined,
  mapObject,
} from "../../utils";

export type VsCodeCommandOrder = [string, ...any[]];
export type VsCodeDriver = Driver<
  Stream<VsCodeCommandOrder>,
  VsCodeDriverSource
>;

type CommandHandler = (...args: any[]) => any;
type CustomCommandsDefinition = {
  [commandName: string]: CommandHandler;
};

type TextEditorCommandArg =
  | string
  | boolean
  | number
  | undefined
  | null
  | vscode.Position
  | vscode.Range
  | vscode.Uri
  | vscode.Location;
type TextEditorCommandHandler = <Args extends TextEditorCommandArg[], Return>(
  editor: vscode.TextEditor,
  edit: vscode.TextEditorEdit,
  ...args: Args
) => Return;
type CustomTextEditorCommandsDefinition = {
  [commandName: string]: TextEditorCommandHandler;
};

export function vsCodeDriver<
  CustomCommands extends CustomCommandsDefinition,
  CustomTextEditorCommands extends CustomTextEditorCommandsDefinition
>(
  customCommands: CustomCommands,
  customTextEditorCommands: CustomTextEditorCommands,
  vscodeContext: vscode.ExtensionContext
): VsCodeDriver {
  Object.keys(customCommands).forEach((commandName) => {
    deferDisposal(
      vscodeContext,
      vscode.commands.registerCommand(commandName, customCommands[commandName])
    );
  });

  Object.keys(customTextEditorCommands).forEach((commandName) => {
    deferDisposal(
      vscodeContext,
      vscode.commands.registerTextEditorCommand(
        commandName,
        customTextEditorCommands[commandName]
      )
    );
  });

  function vsCodeDriverImplementation(
    sink$: Stream<VsCodeCommandOrder>
  ): VsCodeDriverSource {
    sink$.subscribe({
      next: ([command, ...args]) => {
        vscode.commands.executeCommand(command, ...args);
      },
    });

    return new VsCodeDriverSource(vscodeContext);
  }

  return vsCodeDriverImplementation;
}

export class VsCodeDriverSource {
  constructor(private vscodeContext: vscode.ExtensionContext) {}

  public onDidChangeActiveTextEditor(): Stream<vscode.TextEditor | undefined> {
    const activeEditor$ = xs.create<vscode.TextEditor | undefined>({
      start: (producer) => {
        producer.next(vscode.window.activeTextEditor);

        deferDisposal(
          this.vscodeContext,
          vscode.window.onDidChangeActiveTextEditor(
            (editor: vscode.TextEditor | undefined) => {
              producer.next(editor);
            }
          )
        );
      },
      stop: () => {},
    });

    return adapt(activeEditor$);
  }

  public onDidChangeTextEditorSelection(): Stream<
    vscode.TextEditorSelectionChangeEvent
  > {
    const textEditorSelection$ = xs.create<
      vscode.TextEditorSelectionChangeEvent
    >({
      start: (producer) => {
        deferDisposal(
          this.vscodeContext,
          vscode.window.onDidChangeTextEditorSelection(
            (event: vscode.TextEditorSelectionChangeEvent) => {
              producer.next(event);
            }
          )
        );
      },
      stop: () => {},
    });

    return adapt(textEditorSelection$);
  }

  public onDidChangeTextDocument(): Stream<vscode.TextDocumentChangeEvent> {
    const textDocumentChange$ = xs.create<vscode.TextDocumentChangeEvent>({
      start: (producer) => {
        deferDisposal(
          this.vscodeContext,
          vscode.workspace.onDidChangeTextDocument(
            (event: vscode.TextDocumentChangeEvent) => {
              producer.next(event);
            }
          )
        );
      },
      stop: () => {},
    });

    return adapt(textDocumentChange$);
  }
}

const deferDisposal = (
  context: vscode.ExtensionContext,
  disposable: vscode.Disposable
) => {
  context.subscriptions.push(disposable);
};
