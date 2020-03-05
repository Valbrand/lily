import fixFileChanges from "./fileChanges";
import { mockObject } from "../testUtils";
import { ParinferEngine } from "../parinfer";
import { TextEditor, TextDocument } from "../textEditor";

describe("fixFileChanges", () => {
  test("replaces editor with results from parinfer indentMode when the file is valid", () => {
    const parinfer = mockObject<ParinferEngine>({
      indentMode: () => ({
        success: true,
        text: "text-after-indent-mode"
      })
    });
    const mockEditor = mockObject<TextEditor>({
      document: () =>
        mockObject<TextDocument>({
          text: () => "text-before-indent-mode",
          isSupported: () => true
        })
    });

    expect(fixFileChanges(mockEditor, parinfer)).toEqual({
      replaceText: {
        text: "text-after-indent-mode",
        editor: mockEditor
      }
    });
  });

  test("does nothing when the file is not supported", () => {
    const parinfer = mockObject<ParinferEngine>();
    const mockEditor = mockObject<TextEditor>({
      document: () =>
        mockObject<TextDocument>({
          isSupported: () => false
        })
    });

    expect(fixFileChanges(mockEditor, parinfer)).toEqual({});
  });
});
