import type { CvVersion } from "@/data/cvVersions";

export type RecruiterDocumentType = "cv" | "resume";

export const getRecruiterDocumentTitle = (
  documentType: RecruiterDocumentType,
  name = "Kingsley Junior Norku",
): string => `${name} - ${documentType === "resume" ? "Resume" : "CV"}`;

export const getRecruiterDocumentFilename = (
  name: string,
  documentType: RecruiterDocumentType,
): string => {
  const safeName = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const safeDocumentName = safeName || "Professional";
  return `${safeDocumentName}_${documentType === "resume" ? "Resume" : "CV"}`;
};

/**
 * Career-track titles are internal selection metadata. They may drive keyword
 * emphasis and ordering, but they must not leak into recruiter-facing CV or
 * resume copy. Keep the sanitisation deterministic so future tracks inherit
 * the same export boundary without requiring manual edits to every renderer.
 */
export const getRecruiterSafeSummary = (version: CvVersion): string => {
  const internalTitles = [version.title, ...version.targetRoles.split(" • ")]
    .map((value) => value.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  let summary = version.summary;
  for (const title of internalTitles) {
    summary = summary.replace(new RegExp(`\\b${escapeRegExp(title)}\\b`, "gi"), "");
  }

  summary = summary
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.])/g, "$1")
    .replace(/^\s*(?:with|who|experienced)\b/i, "Professional $&")
    .trim();

  return summary || "Experienced professional with a background spanning healthcare operations, finance, claims administration, technology support, and process improvement.";
};

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
