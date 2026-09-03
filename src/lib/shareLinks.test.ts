import { describe, expect, it } from "vitest";
import { getShareLink, getSharePageTitle, isShareDocumentType, isShareRoute, normalizeShareDocumentType } from "./shareLinks";

describe("share links", () => {
  it("builds recruiter-friendly share URLs for each document type", () => {
    expect(getShareLink("claims-manager", "cv")).toBe("/share/cv/claims-manager");
    expect(getShareLink("claims-manager", "resume")).toBe("/share/resume/claims-manager");
    expect(getShareLink("claims-manager", "letter")).toBe("/share/letter/claims-manager");
  });

  it("accepts only supported shared document types", () => {
    expect(isShareDocumentType("CV")).toBe(true);
    expect(isShareDocumentType("Resume")).toBe(true);
    expect(isShareDocumentType("Letter")).toBe(true);
    expect(isShareDocumentType("cover-letter")).toBe(false);
    expect(isShareDocumentType("unknown")).toBe(false);
    expect(isShareDocumentType()).toBe(false);
  });

  it("normalizes supported document types and detects share routes", () => {
    expect(normalizeShareDocumentType("Resume")).toBe("resume");
    expect(isShareRoute("/share/resume/claims-manager")).toBe(true);
    expect(getSharePageTitle("letter")).toBe("Recruiter-ready cover letter");
  });
});
