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

  it("preserves supported markets and trims safe photo URLs", () => {
    const result = normalizeDocumentSettings({
      targetMarket: "germany",
      photoUrl: " https://example.com/photo.jpg ",
      includePhoto: true,
    });

    expect(result.targetMarket).toBe("germany");
    expect(result.photoUrl).toBe("https://example.com/photo.jpg");
    expect(result.includePhoto).toBe(true);
  });

  it("falls back from unsupported markets", () => {
    const result = normalizeDocumentSettings({ targetMarket: "unsupported" as never });

    expect(result.targetMarket).toBe(DEFAULT_DOCUMENT_SETTINGS.targetMarket);
  });

  it("rejects unsafe photo URLs and disables photo inclusion", () => {
    const result = normalizeDocumentSettings({
      photoUrl: "javascript:alert(document.domain)",
      includePhoto: true,
    });

    expect(result.photoUrl).toBe("");
    expect(result.includePhoto).toBe(false);
  });

  it("does not enable photos without a usable photo URL", () => {
    const result = normalizeDocumentSettings({ includePhoto: true, photoUrl: "" });

    expect(result.includePhoto).toBe(false);
  });
});
