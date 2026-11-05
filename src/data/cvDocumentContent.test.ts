import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { cvCatalog } from "@/data/cvCatalog";
import {
  createOriginalCvContent,
  getCvContentIssues,
  getCvDateRangeIssues,
  loadCvDocumentContent,
  resetCvDocumentContent,
  saveCvDocumentContent,
} from "@/data/cvDocumentContent";

describe("CV document content", () => {
  const values = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };

  beforeEach(() => {
    values.clear();
    vi.stubGlobal("window", { localStorage });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates independent editable copies without mutating source records", () => {
    const version = cvCatalog[0];
    const first = createOriginalCvContent(version);
    first.companies[0].roles[0].period = "January 2025 - Present";
    first.coreSkills.push("User-entered skill");

    expect(createOriginalCvContent(version).companies[0].roles[0].period).toBe("April 2023 - Present");
    expect(version.coreSkills).not.toContain("User-entered skill");
  });

  it("saves, reloads, and resets edits independently for each CV version", () => {
    const claims = cvCatalog.find(({ slug }) => slug === "claims-manager");
    const finance = cvCatalog.find(({ slug }) => slug === "accounting-finance");
    if (!claims || !finance) throw new Error("Expected CV test versions to exist.");

    const edited = createOriginalCvContent(claims);
    edited.summary = "User-entered summary.";
    saveCvDocumentContent(claims.slug, edited);

    expect(loadCvDocumentContent(claims).summary).toBe("User-entered summary.");
    expect(loadCvDocumentContent(finance).summary).not.toBe("User-entered summary.");
    resetCvDocumentContent(claims.slug);
    expect(loadCvDocumentContent(claims).summary).not.toBe("User-entered summary.");
    expect(loadCvDocumentContent(finance).summary).not.toBe("User-entered summary.");
  });

  it("flags reversed recognizable date ranges without rewriting them", () => {
    const content = createOriginalCvContent(cvCatalog[0]);
    content.companies[0].roles[0].period = "August 2024 - January 2022";

    expect(getCvDateRangeIssues(content)).toContain(
      "Claims Manager & IT Support at Mount Carmel Hospital & Fertility Centre: the start date is after the end date (August 2024 - January 2022).",
    );
    expect(content.companies[0].roles[0].period).toBe("August 2024 - January 2022");
    expect(getCvContentIssues(content)).toContain(
      "Claims Manager & IT Support at Mount Carmel Hospital & Fertility Centre: the start date is after the end date (August 2024 - January 2022).",
    );
  });

  it("rejects incomplete additions and invalid contact details before saving", () => {
    const content = createOriginalCvContent(cvCatalog[0]);
    content.companies.push({ company: "", location: "", totalPeriod: "", roles: [] });
    content.email = "not-an-email";
    content.linkedin = "javascript:alert(1)";

    const issues = getCvContentIssues(content);
    expect(issues).toContain("Employer 5 needs a name.");
    expect(issues).toContain("Enter a valid email address or leave the email field blank.");
    expect(issues).toContain("LinkedIn must use an http or https URL.");
  });
});
