import { describe, expect, it, vi } from "vitest";
import { cvVersions } from "@/data/cvVersions";
import {
  createCvEditorData,
  cvEditorStorageKey,
  migrateLegacyCvEditorData,
  rebaseCvEditorData,
  loadCvEditorData,
} from "@/lib/cvEditor";

describe("CV editor data", () => {
  it("creates an independent editable snapshot for each career track", () => {
    const claims = createCvEditorData(cvVersions[0]);
    const finance = createCvEditorData(cvVersions[2]);
    expect(claims.summary).toBe(cvVersions[0].summary);
    expect(finance.summary).toBe(cvVersions[2].summary);
    expect(claims.skills).not.toBe(cvVersions[0].coreSkills);
    expect(claims.experience.length).toBeGreaterThan(0);
    expect(claims.education.length).toBeGreaterThan(0);
    expect(claims.leadership.length).toBeGreaterThan(0);
    expect(claims.professionalDevelopment.length).toBeGreaterThan(0);
    expect(claims.languages).toContain("English — Fluent");
    expect(claims.references).toBe("Available on request");
  });

  it("uses a versioned, career-track-specific browser storage key", () => {
    expect(cvEditorStorageKey("claims-manager")).not.toBe(cvEditorStorageKey("accounting-finance"));
    expect(cvEditorStorageKey("claims-manager")).toContain(":v2:");
    expect(cvEditorStorageKey("claims-manager", "owner-a")).not.toBe(cvEditorStorageKey("claims-manager", "owner-b"));
  });

  it("does not import anonymous drafts into an authenticated user's editor", () => {
    const getItem = vi.fn(() => null);
    vi.stubGlobal("window", { localStorage: { getItem, setItem: vi.fn(), removeItem: vi.fn() } });

    const loaded = loadCvEditorData("claims-manager", cvVersions[0], "owner-a");

    expect(getItem).toHaveBeenCalledTimes(1);
    expect(getItem).toHaveBeenCalledWith(cvEditorStorageKey("claims-manager", "owner-a"));
    expect(loaded.summary).toBe(cvVersions[0].summary);
    vi.unstubAllGlobals();
  });

  it("refreshes source dates while preserving fields edited by the user", () => {
    const previous = createCvEditorData(cvVersions[0]);
    const saved = structuredClone(previous);
    const latest = structuredClone(previous);
    saved.experience[0].contributions[0] = "My manually revised achievement";
    latest.experience[0].period = "May 2021 - Present";
    latest.experience[0].contributions[0] = "Updated source achievement";

    const rebased = rebaseCvEditorData(saved, previous, latest);
    expect(rebased.experience[0].period).toBe("May 2021 - Present");
    expect(rebased.experience[0].contributions[0]).toBe("My manually revised achievement");
  });

  it("migrates legacy browser data using current source dates", () => {
    const latest = createCvEditorData(cvVersions[0]);
    const legacy = structuredClone(latest);
    legacy.experience[0].period = "April 2023 - Present";
    legacy.experience[0].contributions[0] = "User-edited achievement";

    const migrated = migrateLegacyCvEditorData(legacy, latest);
    expect(migrated.experience[0].period).toBe(latest.experience[0].period);
    expect(migrated.experience[0].contributions[0]).toBe("User-edited achievement");
  });
});
