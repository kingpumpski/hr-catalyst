import { describe, expect, it } from "vitest";

import { cvCatalog, getCvVersionFromCatalog } from "@/data/cvCatalog";

describe("CV catalog integrity", () => {
  it("contains unique, URL-safe slugs", () => {
    const slugs = cvCatalog.map((version) => version.slug);

    expect(slugs.length).toBeGreaterThan(0);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.every((slug) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))).toBe(true);
  });

  it("provides complete recruiter-facing metadata for every version", () => {
    for (const version of cvCatalog) {
      expect(version.title.trim()).not.toBe("");
      expect(version.targetRoles.trim()).not.toBe("");
      expect(version.summary.trim()).not.toBe("");
      expect(version.coreSkills.length).toBeGreaterThan(0);
      expect(version.highlights.length).toBeGreaterThan(0);
      expect(version.keywords.length).toBeGreaterThan(0);
      expect(version.coverLetter.opening.trim()).not.toBe("");
      expect(version.coverLetter.body.length).toBeGreaterThan(0);
      expect(version.coverLetter.closing.trim()).not.toBe("");
    }
  });

  it("resolves known versions and returns undefined for unknown slugs", () => {
    expect(getCvVersionFromCatalog("vehicle-accounting-specialist")?.title).toContain(
      "Vehicle Accounting Specialist",
    );
    expect(getCvVersionFromCatalog("remote-claims-billing")?.title).toBe(
      "Remote Claims & Billing Operations",
    );
    expect(getCvVersionFromCatalog("does-not-exist")).toBeUndefined();
  });
});
