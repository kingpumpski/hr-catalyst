import { describe, expect, it } from "vitest";
import { cvVersions } from "@/data/cvVersions";
import { createCvEditorData } from "@/lib/cvEditor";
import {
  analyseEditorDocument,
  buildEditorCorpus,
  createEvidenceBasedTailoring,
} from "@/lib/atsKeywords";

describe("evidence-based ATS tailoring", () => {
  it("checks the edited document rather than only the default career-track template", () => {
    const data = createCvEditorData(cvVersions[0]);
    data.summary = "A unique candidate-authored summary phrase";
    expect(buildEditorCorpus(data)).toContain("unique candidate-authored");
    expect(analyseEditorDocument("candidate-authored", data).matched).toHaveLength(1);
  });

  it("rephrases supported claims and does not insert unsupported advert requirements", () => {
    const version = cvVersions.find((item) => item.slug === "claims-manager")!;
    const source = createCvEditorData(version);
    const result = createEvidenceBasedTailoring(source, version, [
      "liaise", "reconcile", "submitted", "rejected", "private", "corrective", "minimum", "received",
    ]);

    expect(result.data).not.toBe(source);
    expect(result.appliedTerms).toEqual(expect.arrayContaining(["liaise", "reconcile", "submitted", "rejected"]));
    expect(result.skippedTerms).toEqual(expect.arrayContaining(["private", "corrective", "minimum", "received"]));
    expect(result.data.experience.flatMap((item) => item.contributions).join(" ")).toMatch(/Liaise with insurers/);
    expect(result.data.experience.flatMap((item) => item.contributions).join(" ")).toMatch(/rejected claims/i);
    expect(source.experience.flatMap((item) => item.contributions).join(" ")).not.toMatch(/Liaise with insurers/);
  });

  it("recalculates the match from the applied document state", () => {
    const version = cvVersions.find((item) => item.slug === "claims-manager")!;
    const source = createCvEditorData(version);
    const advert = "liaise reconciliation submission rejected claims private corrective";
    const before = analyseEditorDocument(advert, source);
    const result = createEvidenceBasedTailoring(source, version, before.missing.map((item) => item.term));
    const after = analyseEditorDocument(advert, result.data);
    expect(after.score).toBeGreaterThanOrEqual(before.score);
    expect(after.matched.length).toBeGreaterThanOrEqual(before.matched.length);
  });
});
