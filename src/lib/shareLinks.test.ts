import { describe, expect, it } from "vitest";

import {
  getShareLink,
  getSharePageTitle,
  isShareDocumentType,
  isShareRoute,
  normalizeShareDocumentType,
  parseShareRoute,
} from "@/lib/shareLinks";

describe("share link contracts", () => {
  it("accepts only supported document types, case-insensitively", () => {
    expect(isShareDocumentType("cv")).toBe(true);
    expect(isShareDocumentType("RESUME")).toBe(true);
    expect(isShareDocumentType("Letter")).toBe(true);
    expect(isShareDocumentType("pdf")).toBe(false);
    expect(isShareDocumentType(undefined)).toBe(false);
  });

  it("normalizes supported document types", () => {
    expect(normalizeShareDocumentType("CV")).toBe("cv");
    expect(normalizeShareDocumentType("Resume")).toBe("resume");
    expect(normalizeShareDocumentType("LETTER")).toBe("letter");
  });

  it("keeps fallback normalization separate from route validation", () => {
    expect(normalizeShareDocumentType("unknown")).toBe("cv");
    expect(isShareDocumentType("unknown")).toBe(false);
    expect(isShareDocumentType(undefined)).toBe(false);
  });

  it("generates stable share URLs and recruiter-facing labels", () => {
    expect(getShareLink("remote-claims-billing", "cv")).toBe(
      "/share/cv/remote-claims-billing",
    );
    expect(getShareLink("remote-claims-billing", "resume")).toBe(
      "/share/resume/remote-claims-billing",
    );
    expect(getShareLink("remote-claims-billing", "letter")).toBe(
      "/share/letter/remote-claims-billing",
    );
    expect(getSharePageTitle("cv")).toBe("Recruiter-ready CV");
    expect(getSharePageTitle("resume")).toBe("Recruiter-ready resume");
    expect(getSharePageTitle("letter")).toBe("Recruiter-ready cover letter");
  });

  it("recognizes only the shared-document URL prefix", () => {
    expect(isShareRoute("/share/cv/remote-claims-billing")).toBe(true);
    expect(isShareRoute("/cv/remote-claims-billing")).toBe(false);
    expect(isShareRoute("/share")).toBe(false);
  });

  it("parses only canonical share routes with safe slugs", () => {
    expect(parseShareRoute("/share/cv/remote-claims-billing")).toEqual({
      documentType: "cv",
      slug: "remote-claims-billing",
    });
    expect(parseShareRoute("/SHARE/Resume/REMOTE-CLAIMS-BILLING")).toEqual({
      documentType: "resume",
      slug: "REMOTE-CLAIMS-BILLING",
    });
    expect(parseShareRoute("/share/letter/customer-admin-operations/")).toEqual({
      documentType: "letter",
      slug: "customer-admin-operations",
    });
  });

  it("rejects malformed or unsupported share routes", () => {
    const invalidRoutes = [
      "/share",
      "/share/cv",
      "/share/pdf/remote-claims-billing",
      "/share/cv/remote claims billing",
      "/share/cv/remote_claims_billing",
      "/share/cv/remote-claims-billing/extra",
      "/cv/remote-claims-billing",
    ];

    for (const route of invalidRoutes) {
      expect(parseShareRoute(route)).toBeUndefined();
    }
  });
});
