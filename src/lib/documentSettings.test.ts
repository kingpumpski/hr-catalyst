import { describe, expect, it } from "vitest";
import { DEFAULT_DOCUMENT_SETTINGS, normalizeDocumentSettings, parseStoredDocumentSettings } from "./documentSettings";

describe("document settings", () => {
  it("returns the default settings when no stored value exists", () => {
    expect(parseStoredDocumentSettings(null)).toEqual(DEFAULT_DOCUMENT_SETTINGS);
  });

  it("normalizes partial values and keeps the defaults for missing keys", () => {
    expect(
      normalizeDocumentSettings({
        showContactDetails: false,
        showLocation: true,
      } as Partial<typeof DEFAULT_DOCUMENT_SETTINGS>),
    ).toEqual({
      ...DEFAULT_DOCUMENT_SETTINGS,
      showContactDetails: false,
      showLocation: true,
    });
  });
});
