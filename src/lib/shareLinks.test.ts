import { describe, expect, it } from "vitest";
import { getShareLink, getSharePageTitle, isShareRoute, normalizeShareDocumentType } from "./shareLinks";

describe("share links", () => {
  it("builds recruiter-friendly share URLs for each document type", () => {
    expect(getShareLink("claims-manager", "cv")).toBe("/share/cv/claims-manager");
    expect(getShareLink("claims-manager", "resume")).toBe("/share/resume/claims-manager");
    expect(getShareLink("claims-manager", "letter")).toBe("/share/letter/claims-manager");
  });

  it("normalizes document types and detects share routes", () => {
    expect(normalizeShareDocumentType("Resume")).toBe("resume");
    expect(isShareRoute("/share/resume/claims-manager")).toBe(true);
    expect(getSharePageTitle("letter")).toBe("Recruiter-ready cover letter");
  });
});
