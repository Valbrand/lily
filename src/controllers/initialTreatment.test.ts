import performInitialTreatment from "./initialTreatment";
import { ParinferEngine } from "../parinfer";
import { mockObject } from "../testUtils";
import { TextEditor, TextDocument } from "../models/textEditor";

describe("performInitialTreatment", () => {
  test("returns a replaceTextEffect with valid input", () => {
    const parinfer = mockObject<ParinferEngine>({
      parenMode: () => ({
        success: true,
        text: "replace-with-this",
        cursorPosition: {
          line: 1,
          column: 2
        }
      })
    });
    const textEditor = mockObject<TextEditor>({
      document: () =>
        mockObject<TextDocument>({
          text: () => "irrelevant",
          isSupported: () => true
        }),
      cursorPosition: () => ({ line: 0, column: 0 }),
      currentSelection: () => ({
        start: { line: 0, column: 0 },
        end: { line: 0, column: 0 }
      })
    });

    expect(performInitialTreatment(textEditor, parinfer)).toEqual({
      replaceText: {
        text: "replace-with-this",
        editor: textEditor,
        cursorPosition: {
          line: 1,
          column: 2
        }
      }
    });
  });

  test("unsupported files are ignored", () => {
    const parinfer = mockObject<ParinferEngine>();
    const textEditor = mockObject<TextEditor>({
      document: jest.fn().mockReturnValue(
        mockObject<TextDocument>({
          isSupported: jest.fn().mockReturnValue(false)
        })
      )
    });

    expect(performInitialTreatment(textEditor, parinfer)).toEqual({});
  });

  test("invalid inputs result in an error exhibition effect", () => {
    const parinfer = mockObject<ParinferEngine>({
      parenMode: jest.fn().mockReturnValue({ success: false })
    });
    const textEditor = mockObject<TextEditor>({
      document: () =>
        mockObject<TextDocument>({
          isSupported: () => true,
          fileName: () => "file-name",
          text: () => "document-text"
        }),
      cursorPosition: () => ({ line: 0, column: 0 }),
      currentSelection: () => ({
        start: { line: 0, column: 0 },
        end: { line: 0, column: 0 }
      })
    });

    expect(performInitialTreatment(textEditor, parinfer)).toEqual({
      showError: expect.anything()
    });
  });
});
