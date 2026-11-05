import { education, type EducationEntry } from "@/data/education";
import type { CvVersion } from "@/data/cvVersions";
import {
  companies,
  leadership,
  profile,
  workshopsAndSeminars,
  type Company,
  type LanguageEntry,
  type LeadershipEntry,
  type Role,
  type WorkshopEntry,
} from "@/data/profile";
import { getRecruiterSafeSummary } from "@/lib/recruiterDocument";

export type CvDocumentContent = {
  name: string;
  address: string;
  email: string;
  phone: string;
  linkedin: string;
  references: string;
  summary: string;
  coreSkills: string[];
  highlights: string[];
  companies: Company[];
  education: EducationEntry[];
  leadership: LeadershipEntry[];
  workshops: WorkshopEntry[];
  languages: LanguageEntry[];
  strengths: string[];
};

const originalStrengths = [
  "Accuracy",
  "Integrity",
  "Financial Discipline",
  "Attention to Detail",
  "Confidentiality",
  "Analytical Thinking",
  "Problem Solving",
  "Operational Coordination",
  "Documentation",
  "Team Collaboration",
  "Time Management",
  "Continuous Improvement",
];

const storageKey = (slug: string) => `hr-catalyst-cv-content:${slug}`;

export const formatEducationQualification = (entry: EducationEntry): string => {
  const fieldSuffix = entry.field
    ? new RegExp(`(?:,\\s*|\\s*[—–-]\\s*|\\s+in\\s+)${entry.field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")
    : /$^/;
  const qualification = entry.qualification.replace(fieldSuffix, "");
  return `Qualification: ${qualification}${entry.field ? ` — Field: ${entry.field}` : ""}`;
};

export const createOriginalCvContent = (version: CvVersion): CvDocumentContent => ({
  name: profile.name,
  address: profile.address,
  email: profile.email,
  phone: profile.phone,
  linkedin: profile.linkedin,
  references: profile.references,
  summary: getRecruiterSafeSummary(version),
  coreSkills: [...version.coreSkills],
  highlights: [...version.highlights],
  companies: structuredClone(companies),
  education: structuredClone(education),
  leadership: structuredClone(leadership),
  workshops: structuredClone(workshopsAndSeminars),
  languages: structuredClone(profile.languages),
  strengths: [...originalStrengths],
});

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const hasStringFields = (value: unknown, fields: string[]) =>
  isRecord(value) && fields.every((field) => typeof value[field] === "string");

const isRole = (value: unknown): value is Role =>
  hasStringFields(value, ["title", "employmentType", "location", "period", "duration", "summary"]) &&
  isRecord(value) &&
  isStringArray(value.contributions) &&
  isStringArray(value.skills);

const isCompany = (value: unknown): value is Company =>
  hasStringFields(value, ["company", "location", "totalPeriod"]) &&
  isRecord(value) &&
  Array.isArray(value.roles) &&
  value.roles.every(isRole);

const isEducation = (value: unknown): value is EducationEntry =>
  hasStringFields(value, ["school", "qualification", "field", "period", "location", "description"]) &&
  isRecord(value) &&
  (value.activities === undefined || isStringArray(value.activities)) &&
  (value.coursework === undefined || isStringArray(value.coursework));

const isLeadership = (value: unknown): value is LeadershipEntry =>
  hasStringFields(value, ["company", "title", "location", "totalPeriod", "employmentType", "period", "duration", "summary"]) &&
  isRecord(value) &&
  Array.isArray(value.roles) &&
  value.roles.every(isRole) &&
  isStringArray(value.contributions) &&
  isStringArray(value.skills);

const isWorkshop = (value: unknown): value is WorkshopEntry =>
  hasStringFields(value, ["title", "organization", "period", "location", "summary"]) &&
  isRecord(value) &&
  isStringArray(value.highlights) &&
  isStringArray(value.skills);

const isLanguage = (value: unknown): value is LanguageEntry =>
  hasStringFields(value, ["name", "proficiency"]) &&
  isRecord(value) &&
  (value.proficiency === "Fluent" || value.proficiency === "Conversational");

const isCvDocumentContent = (value: unknown): value is CvDocumentContent => {
  if (!isRecord(value)) return false;
  const content = value;
  return (
    hasStringFields(content, ["name", "address", "email", "phone", "linkedin", "references", "summary"]) &&
    isStringArray(content.coreSkills) &&
    isStringArray(content.highlights) &&
    isStringArray(content.strengths) &&
    Array.isArray(content.companies) &&
    content.companies.every(isCompany) &&
    Array.isArray(content.education) &&
    content.education.every(isEducation) &&
    Array.isArray(content.leadership) &&
    content.leadership.every(isLeadership) &&
    Array.isArray(content.workshops) &&
    content.workshops.every(isWorkshop) &&
    Array.isArray(content.languages) &&
    content.languages.every(isLanguage)
  );
};

export const loadCvDocumentContent = (version: CvVersion): CvDocumentContent => {
  const original = createOriginalCvContent(version);
  if (typeof window === "undefined") return original;

  const stored = window.localStorage.getItem(storageKey(version.slug));
  if (stored === null) return original;

  let parsed: unknown;
  try {
    parsed = JSON.parse(stored);
  } catch (error) {
    throw new Error("Saved CV edits could not be read. Reset this version to restore its original content.", {
      cause: error,
    });
  }
  if (!isCvDocumentContent(parsed)) {
    throw new Error("Saved CV edits are invalid. Reset this version to restore its original content.");
  }
  return parsed;
};

export const saveCvDocumentContent = (slug: string, content: CvDocumentContent): void => {
  if (typeof window === "undefined") {
    throw new Error("CV edits can only be saved in a browser.");
  }
  window.localStorage.setItem(storageKey(slug), JSON.stringify(content));
};

export const resetCvDocumentContent = (slug: string): void => {
  if (typeof window === "undefined") {
    throw new Error("CV edits can only be reset in a browser.");
  }
  window.localStorage.removeItem(storageKey(slug));
};

const monthNames =
  "Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?";
const periodPattern = new RegExp(
  `^\\s*(Present|(?:${monthNames})\\s+\\d{4}|\\d{4})\\s*[-\\u2013\\u2014]\\s*(Present|(?:${monthNames})\\s+\\d{4}|\\d{4})\\s*$`,
  "i",
);

const periodValue = (value: string): number | undefined => {
  const year = value.match(/\d{4}/)?.[0];
  if (!year) return undefined;
  const month = value.match(/^[A-Za-z]+/)?.[0];
  if (!month) return Number(year) * 12;
  const monthIndex = [
    "jan", "feb", "mar", "apr", "may", "jun",
    "jul", "aug", "sep", "oct", "nov", "dec",
  ].indexOf(month.slice(0, 3).toLowerCase());
  return monthIndex < 0 ? undefined : Number(year) * 12 + monthIndex;
};

export const getCvDateRangeIssues = (content: CvDocumentContent): string[] => {
  const periods: { label: string; value: string }[] = [];
  content.companies.forEach((company) =>
    company.roles.forEach((role) =>
      periods.push({ label: `${role.title || "Work role"} at ${company.company || "employer"}`, value: role.period }),
    ),
  );
  content.education.forEach((entry) =>
    periods.push({ label: entry.school || "Education", value: entry.period }),
  );
  content.leadership.forEach((entry) =>
    periods.push({ label: entry.title || "Leadership experience", value: entry.period }),
  );
  content.workshops.forEach((entry) =>
    periods.push({ label: entry.title || "Professional development", value: entry.period }),
  );

  return periods.flatMap(({ label, value }) => {
    const match = value.match(periodPattern);
    if (!match || (match[2].toLowerCase() === "present" && match[1].toLowerCase() !== "present")) return [];
    if (match[1].toLowerCase() === "present" && match[2].toLowerCase() !== "present") {
      return [`${label}: the start date is after the end date (${value}).`];
    }
    if (match[2].toLowerCase() === "present") return [];
    const start = periodValue(match[1]);
    const end = periodValue(match[2]);
    return start !== undefined && end !== undefined && start > end
      ? [`${label}: the start date is after the end date (${value}).`]
      : [];
  });
};

export const getCvContentIssues = (content: CvDocumentContent): string[] => {
  const issues: string[] = [];
  if (!content.name.trim()) issues.push("Name is required.");
  if (!content.summary.trim()) issues.push("Professional summary is required.");
  if (content.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.email.trim())) {
    issues.push("Enter a valid email address or leave the email field blank.");
  }
  if (content.linkedin.trim()) {
    try {
      const linkedInUrl = new URL(content.linkedin);
      if (linkedInUrl.protocol !== "http:" && linkedInUrl.protocol !== "https:") {
        issues.push("LinkedIn must use an http or https URL.");
      }
    } catch {
      issues.push("Enter a valid LinkedIn URL or leave the LinkedIn field blank.");
    }
  }
  content.companies.forEach((company, companyIndex) => {
    if (!company.company.trim()) issues.push(`Employer ${companyIndex + 1} needs a name.`);
    company.roles.forEach((role, roleIndex) => {
      if (!role.title.trim()) issues.push(`Role ${roleIndex + 1} at ${company.company || `employer ${companyIndex + 1}`} needs a job title.`);
      if (!role.period.trim()) issues.push(`${role.title || `Role ${roleIndex + 1}`} needs an employment date range.`);
    });
  });
  content.education.forEach((entry, index) => {
    if (!entry.school.trim()) issues.push(`Education entry ${index + 1} needs an institution name.`);
    if (!entry.period.trim()) issues.push(`${entry.school || `Education entry ${index + 1}`} needs a date range.`);
  });
  content.leadership.forEach((entry, index) => {
    if (!entry.title.trim()) issues.push(`Leadership entry ${index + 1} needs a title.`);
    if (!entry.period.trim()) issues.push(`${entry.title || `Leadership entry ${index + 1}`} needs a date range.`);
  });
  content.workshops.forEach((entry, index) => {
    if (!entry.title.trim()) issues.push(`Professional development entry ${index + 1} needs a title.`);
    if (!entry.period.trim()) issues.push(`${entry.title || `Professional development entry ${index + 1}`} needs a date.`);
  });
  content.languages.forEach((entry, index) => {
    if (!entry.name.trim()) issues.push(`Language entry ${index + 1} needs a name.`);
  });
  return [...issues, ...getCvDateRangeIssues(content)];
};
