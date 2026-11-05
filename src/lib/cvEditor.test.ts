import { describe, expect, it } from "vitest";
import { cvVersions } from "@/data/cvVersions";
import { createCvEditorData, cvEditorStorageKey } from "@/lib/cvEditor";

describe("CV editor data", () => {
  it("creates an independent editable snapshot for each career track", () => {
    const claims = createCvEditorData(cvVersions[0]);
    const finance = createCvEditorData(cvVersions[2]);
    expect(claims.summary).toBe(cvVersions[0].summary);
    expect(finance.summary).toBe(cvVersions[2].summary);
    expect(claims.skills).not.toBe(cvVersions[0].coreSkills);
    expect(claims.experience.length).toBeGreaterThan(0);
    expect(claims.education.length).toBeGreaterThan(0);
  });
  it("uses a version-specific, namespaced browser storage key", () => {
    expect(cvEditorStorageKey("claims-manager")).not.toBe(cvEditorStorageKey("accounting-finance"));
    expect(cvEditorStorageKey("claims-manager")).toContain(":v1:");
  });
});
