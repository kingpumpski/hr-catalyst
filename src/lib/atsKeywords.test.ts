import { describe, expect, it } from "vitest";

import { cvCatalog } from "@/data/cvCatalog";
import { createOriginalCvContent } from "@/data/cvDocumentContent";
import {
  analyseJobDescription,
  getSupportedCvWordingSuggestions,
} from "@/lib/atsKeywords";

describe("ATS keyword matching and factual wording suggestions", () => {
  const version = cvCatalog.find(({ slug }) => slug === "claims-manager");
  if (!version) throw new Error("Claims Manager CV fixture is missing.");

  it("checks the supplied saved or draft document and recognizes common word forms", () => {
    const content = createOriginalCvContent(version);
    content.highlights = ["Reconciled rejected claims submitted after careful vetting."];

    const analysis = analyseJobDescription(
      "reconcile rejected submitted vet",
      version,
      content,
    );

    expect(analysis.missing).toEqual([]);
    expect(analysis.matched.map(({ term }) => term)).toEqual(["reconcile", "reject", "submit", "vet"]);
  });

  it("offers only concise suggestions supported by existing education and work facts", () => {
    const content = createOriginalCvContent(version);
    const suggestions = getSupportedCvWordingSuggestions(content, [
      "degree", "liaise", "oversee", "vet", "private", "supervise", "train",
    ]);

    expect(suggestions.map(({ term }) => term)).toEqual(["degree", "liaise", "oversee", "vet"]);
    expect(suggestions.every(({ before, after }) => before !== after && after.length <= before.length + 45)).toBe(true);
    expect(suggestions.find(({ term }) => term === "degree")?.after).toContain("Bachelor of Science degree (BSc)");
    expect(suggestions.find(({ term }) => term === "liaise")?.after).toMatch(/Liaise/i);
    expect(suggestions.find(({ term }) => term === "oversee")?.after).toMatch(/Oversee end-to-end/i);
    expect(suggestions.find(({ term }) => term === "vet")?.after).toContain("vetted claims documentation");
  });

  it("rechecks the revised CV after the user applies supported suggestions", () => {
    const content = createOriginalCvContent(version);
    const initial = analyseJobDescription("degree field qualification liaise oversee vet private", version, content);
    const suggestions = getSupportedCvWordingSuggestions(
      content,
      initial.missing.map(({ term }) => term),
    );
    const revised = suggestions.reduce((next, suggestion) => suggestion.apply(next), content);
    const updated = analyseJobDescription("degree field qualification liaise oversee vet private", version, revised);

    expect(updated.matched.map(({ term }) => term)).toEqual(["degree", "field", "liaise", "oversee", "qualification", "vet"]);
    expect(updated.missing.map(({ term }) => term)).toEqual(["private"]);
    expect(updated.score).toBeGreaterThan(initial.score);
    expect(content.education[0].qualification).toBe("Bachelor of Science (BSc), Accounting");
  });

  it("uses explicit qualification and field labels rendered in the actual CV document", () => {
    const content = createOriginalCvContent(version);
    const analysis = analyseJobDescription("qualification field", version, content);

    expect(analysis.missing).toEqual([]);
  });

  it("does not invent content for unsupported missing requirements", () => {
    const content = createOriginalCvContent(version);
    const suggestions = getSupportedCvWordingSuggestions(content, [
      "private", "minimum", "supervise", "train", "corrective", "received",
    ]);

    expect(suggestions).toEqual([]);
  });
});
