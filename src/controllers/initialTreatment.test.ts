import performInitialTreatment from "./initialTreatment";
import { ParinferEngine } from "../parinfer";
import { mockObject } from "../testUtils";
import { TextEditor, TextDocument } from "../textEditor";

describe("performInitialTreatment", () => {
  test("returns a replaceTextEffect with valid input", () => {
    const parinfer = mockObject<ParinferEngine>({
      parenMode: jest.fn().mockReturnValue({
        success: true,
        text: "replace-with-this"
      })
    });
    const textEditor = mockObject<TextEditor>({
      document: jest.fn().mockReturnValue(
        mockObject<TextDocument>({
          text: jest.fn().mockReturnValue("irrelevant"),
          isSupported: jest.fn().mockReturnValue(true)
        })
      )
    });

    expect(performInitialTreatment(textEditor, parinfer)).toEqual({
      replaceText: {
        text: "replace-with-this",
        editor: textEditor
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
      document: jest.fn().mockReturnValue(
        mockObject<TextDocument>({
          isSupported: jest.fn().mockReturnValue(true),
          fileName: jest.fn().mockReturnValue("file-name"),
          text: jest.fn().mockReturnValue("document-text")
        })
      )
    });

    expect(performInitialTreatment(textEditor, parinfer)).toEqual({
      showError: expect.anything()
    });
  });
});
