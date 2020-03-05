import performInitialTreatment from "./initialTreatment";
import { TextEditor, TextDocument } from "../textEditor";
import { ParinferEngine } from "../parinfer";

describe("performInitialTreatment", () => {
  test("returns a replaceTextEffect with valid input", () => {
    const parinfer = mockParinferEngine({
      parenMode: jest
        .fn()
        .mockReturnValue({ success: true, text: "replace-with-this" })
    });
    const textEditor = mockTextEditor();

    expect(performInitialTreatment(textEditor, parinfer)).toEqual({
      replaceText: {
        text: "replace-with-this",
        editor: textEditor
      }
    });
  });

  test("unsupported files are ignored", () => {
    const parinfer = mockParinferEngine();
    const textEditor = mockTextEditor({
      document: jest
        .fn()
        .mockReturnValue(
          mockTextDocument({ isSupported: jest.fn().mockReturnValue(false) })
        )
    });

    expect(performInitialTreatment(textEditor, parinfer)).toEqual({});
  });

  test("invalid inputs result in an error exhibition effect", () => {
    const parinfer = mockParinferEngine({
      parenMode: jest.fn().mockReturnValue({ success: false })
    });
    const textEditor = mockTextEditor();

    expect(performInitialTreatment(textEditor, parinfer)).toEqual({
      showError: expect.anything()
    });
  });
});

function mockParinferEngine(
  overrides: Partial<ParinferEngine> = {}
): ParinferEngine {
  const baseParinferEngine: ParinferEngine = {
    parenMode: jest.fn()
  };

  return {
    ...baseParinferEngine,
    ...overrides
  };
}

function mockTextDocument(overrides: Partial<TextDocument> = {}): TextDocument {
  const baseMockDocument: TextDocument = {
    isSupported: jest.fn().mockReturnValue(true),
    fileName: jest.fn(),
    text: jest.fn()
  };

  return {
    ...baseMockDocument,
    ...overrides
  };
}

function mockTextEditor(overrides: Partial<TextEditor> = {}): TextEditor {
  const baseMockEditor: TextEditor = {
    document: jest.fn().mockReturnValue(mockTextDocument()),

    _rawEditor: "irrelevant"
  };

  return {
    ...baseMockEditor,
    ...overrides
  };
}
