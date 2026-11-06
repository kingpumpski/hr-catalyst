import { companies, leadership, profile, workshopsAndSeminars } from "@/data/profile";
import { education } from "@/data/education";
import type { CvVersion } from "@/data/cvVersions";

export type CvEditorExperience = { id: string; company: string; title: string; location: string; period: string; contributions: string[] };
export type CvEditorEducation = { id: string; school: string; qualification: string; field: string; period: string; location: string; description: string };
export type CvEditorData = {
  profile: { name: string; address: string; phone: string; email: string; linkedin: string };
  summary: string; skills: string[]; highlights: string[];
  experience: CvEditorExperience[]; education: CvEditorEducation[];
  leadership: string[]; professionalDevelopment: string[]; professionalStrengths: string[];
  languages: string[]; references: string;
};

const STORAGE_VERSION = 2;
const legacyStorageKey = (slug: string) => `hr-catalyst:cv-editor:v1:${slug}`;

export const createCvEditorData = (version: CvVersion): CvEditorData => ({
  profile: { name: profile.name, address: profile.address, phone: profile.phone, email: profile.email, linkedin: profile.linkedin },
  summary: version.summary,
  skills: [...version.coreSkills],
  highlights: [...version.highlights],
  experience: companies.flatMap((company, companyIndex) => company.roles.map((role, roleIndex) => ({
    id: `${companyIndex}-${roleIndex}`, company: company.company, title: role.title,
    location: role.location, period: role.period, contributions: [...role.contributions],
  }))),
  education: education.map((entry, index) => ({
    id: String(index), school: entry.school, qualification: entry.qualification, field: entry.field,
    period: entry.period, location: entry.location, description: entry.description,
  })),
  leadership: leadership.map(entry => `${entry.title} — ${entry.company} (${entry.period})`),
  professionalDevelopment: workshopsAndSeminars.map(entry => `${entry.title} — ${entry.organization} (${entry.period})`),
  professionalStrengths: ["Accuracy", "Integrity", "Financial Discipline", "Attention to Detail", "Confidentiality", "Analytical Thinking", "Problem Solving", "Operational Coordination", "Documentation", "Team Collaboration", "Time Management", "Continuous Improvement"],
  languages: profile.languages.map(entry => `${entry.name} — ${entry.proficiency}`),
  references: profile.references,
});

export const cvEditorStorageKey = (slug: string) => `hr-catalyst:cv-editor:v${STORAGE_VERSION}:${slug}`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isCvEditorData = (value: unknown): value is CvEditorData =>
  isRecord(value) && isRecord(value.profile) && typeof value.profile.name === "string" &&
  typeof value.summary === "string" && Array.isArray(value.skills) &&
  Array.isArray(value.highlights) && Array.isArray(value.experience) &&
  Array.isArray(value.education);

const mergeWithSourceUpdates = (saved: unknown, previousSource: unknown, latestSource: unknown): unknown => {
  if (Array.isArray(saved) && Array.isArray(previousSource) && Array.isArray(latestSource)) {
    const keyed = [...saved, ...previousSource, ...latestSource].every(
      item => isRecord(item) && typeof item.id === "string",
    );
    if (keyed) {
      const savedById = new Map(saved.map(item => [String((item as Record<string, unknown>).id), item]));
      const previousById = new Map(previousSource.map(item => [String((item as Record<string, unknown>).id), item]));
      const merged = latestSource.map(item => {
        const id = String((item as Record<string, unknown>).id);
        return savedById.has(id)
          ? mergeWithSourceUpdates(savedById.get(id), previousById.get(id), item)
          : item;
      });
      const latestIds = new Set(latestSource.map(item => String((item as Record<string, unknown>).id)));
      for (const item of saved) {
        const id = String((item as Record<string, unknown>).id);
        if (!latestIds.has(id)) merged.push(item);
      }
      return merged;
    }
    return JSON.stringify(saved) === JSON.stringify(previousSource) ? latestSource : saved;
  }
  if (isRecord(saved) && isRecord(previousSource) && isRecord(latestSource)) {
    const result: Record<string, unknown> = { ...latestSource };
    for (const key of Object.keys(saved)) {
      result[key] = key in previousSource && key in latestSource
        ? mergeWithSourceUpdates(saved[key], previousSource[key], latestSource[key])
        : saved[key];
    }
    return result;
  }
  return JSON.stringify(saved) === JSON.stringify(previousSource) ? latestSource : saved;
};

/** Rebase saved content against current source data without discarding user-authored edits. */
export const rebaseCvEditorData = (
  saved: CvEditorData,
  previousSource: CvEditorData,
  latestSource: CvEditorData,
): CvEditorData => mergeWithSourceUpdates(saved, previousSource, latestSource) as CvEditorData;

/** Migrate v1 browser data: preserve user edits, but refresh source-owned employment/education dates. */
export const migrateLegacyCvEditorData = (saved: CvEditorData, latestSource: CvEditorData): CvEditorData => {
  const savedExperience = new Map(saved.experience.map(item => [item.id, item]));
  const savedEducation = new Map(saved.education.map(item => [item.id, item]));
  return {
    ...latestSource,
    ...saved,
    profile: { ...latestSource.profile, ...saved.profile },
    experience: [
      ...latestSource.experience.map(item => ({
        ...(savedExperience.get(item.id) ?? item),
        period: item.period,
      })),
      ...saved.experience.filter(item => !latestSource.experience.some(current => current.id === item.id)),
    ],
    education: [
      ...latestSource.education.map(item => ({
        ...(savedEducation.get(item.id) ?? item),
        period: item.period,
      })),
      ...saved.education.filter(item => !latestSource.education.some(current => current.id === item.id)),
    ],
  };
};

export const loadCvEditorData = (slug: string, version: CvVersion): CvEditorData => {
  const latestSource = createCvEditorData(version);
  if (typeof window === "undefined") return latestSource;
  try {
    const currentRaw = window.localStorage.getItem(cvEditorStorageKey(slug));
    if (currentRaw) {
      const parsed: unknown = JSON.parse(currentRaw);
      if (isRecord(parsed) && parsed.schemaVersion === STORAGE_VERSION &&
        isCvEditorData(parsed.data) && isCvEditorData(parsed.sourceSnapshot)) {
        return rebaseCvEditorData(parsed.data, parsed.sourceSnapshot, latestSource);
      }
      return latestSource;
    }

    const legacyRaw = window.localStorage.getItem(legacyStorageKey(slug));
    if (!legacyRaw) return latestSource;
    const legacy: unknown = JSON.parse(legacyRaw);
    return isCvEditorData(legacy) ? migrateLegacyCvEditorData(legacy, latestSource) : latestSource;
  } catch {
    return latestSource;
  }
};

export const saveCvEditorData = (slug: string, data: CvEditorData, version: CvVersion) => {
  if (typeof window === "undefined") return false;
  try {
    const envelope = {
      schemaVersion: STORAGE_VERSION,
      data,
      sourceSnapshot: createCvEditorData(version),
    };
    window.localStorage.setItem(cvEditorStorageKey(slug), JSON.stringify(envelope));
    window.localStorage.removeItem(legacyStorageKey(slug));
    return true;
  } catch {
    return false;
  }
};

export const parseEditorLines = (value: string) => value.split("\\n").map(item => item.trim()).filter(Boolean);
