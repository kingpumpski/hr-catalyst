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

export const cvEditorStorageKey = (slug: string) => `hr-catalyst:cv-editor:v1:${slug}`;

export const loadCvEditorData = (slug: string, version: CvVersion): CvEditorData => {
  const fallback = createCvEditorData(version);
  if (typeof window === "undefined") return fallback;
  try {
    const saved = window.localStorage.getItem(cvEditorStorageKey(slug));
    if (!saved) return fallback;
    const parsed: unknown = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object") return fallback;
    const candidate = parsed as Partial<CvEditorData>;
    if (!candidate.profile || typeof candidate.profile.name !== "string" ||
      typeof candidate.summary !== "string" || !Array.isArray(candidate.skills) ||
      !Array.isArray(candidate.highlights) || !Array.isArray(candidate.experience) ||
      !Array.isArray(candidate.education)) return fallback;
    const strings = (items: unknown, defaultValue: string[]) =>
      Array.isArray(items) ? items.filter((item): item is string => typeof item === "string") : defaultValue;
    return {
      ...fallback, ...candidate, profile: { ...fallback.profile, ...candidate.profile },
      skills: strings(candidate.skills, fallback.skills),
      highlights: strings(candidate.highlights, fallback.highlights),
      experience: candidate.experience as CvEditorExperience[],
      education: candidate.education as CvEditorEducation[],
      leadership: strings(candidate.leadership, fallback.leadership),
      professionalDevelopment: strings(candidate.professionalDevelopment, fallback.professionalDevelopment),
      professionalStrengths: strings(candidate.professionalStrengths, fallback.professionalStrengths),
      languages: strings(candidate.languages, fallback.languages),
      references: typeof candidate.references === "string" ? candidate.references : fallback.references,
    };
  } catch { return fallback; }
};

export const saveCvEditorData = (slug: string, data: CvEditorData) => {
  if (typeof window === "undefined") return false;
  try { window.localStorage.setItem(cvEditorStorageKey(slug), JSON.stringify(data)); return true; }
  catch { return false; }
};

export const parseEditorLines = (value: string) => value.split("\n").map(item => item.trim()).filter(Boolean);
