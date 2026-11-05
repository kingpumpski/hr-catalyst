import { companies, profile } from "@/data/profile";
import { education } from "@/data/education";
import type { CvVersion } from "@/data/cvVersions";

export type CvEditorExperience = {
  id: string;
  company: string;
  title: string;
  location: string;
  period: string;
  contributions: string[];
};

export type CvEditorEducation = {
  id: string;
  school: string;
  qualification: string;
  field: string;
  period: string;
  location: string;
  description: string;
};

export type CvEditorData = {
  profile: { name: string; address: string; phone: string; email: string; linkedin: string };
  summary: string;
  skills: string[];
  highlights: string[];
  experience: CvEditorExperience[];
  education: CvEditorEducation[];
};

const cleanLines = (value: string) => value.split("\n").map((item) => item.trim()).filter(Boolean);

export const createCvEditorData = (version: CvVersion): CvEditorData => ({
  profile: {
    name: profile.name,
    address: profile.address,
    phone: profile.phone,
    email: profile.email,
    linkedin: profile.linkedin,
  },
  summary: version.summary,
  skills: [...version.coreSkills],
  highlights: [...version.highlights],
  experience: companies.flatMap((company, companyIndex) =>
    company.roles.map((role, roleIndex) => ({
      id: `${companyIndex}-${roleIndex}`,
      company: company.company,
      title: role.title,
      location: role.location,
      period: role.period,
      contributions: [...role.contributions],
    })),
  ),
  education: education.map((entry, index) => ({
    id: String(index),
    school: entry.school,
    qualification: entry.qualification,
    field: entry.field,
    period: entry.period,
    location: entry.location,
    description: entry.description,
  })),
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
    if (
      !candidate.profile || typeof candidate.profile.name !== "string" ||
      typeof candidate.summary !== "string" || !Array.isArray(candidate.skills) ||
      !Array.isArray(candidate.highlights) || !Array.isArray(candidate.experience) ||
      !Array.isArray(candidate.education)
    ) return fallback;
    return {
      ...fallback,
      ...candidate,
      profile: { ...fallback.profile, ...candidate.profile },
      skills: candidate.skills.filter((item): item is string => typeof item === "string"),
      highlights: candidate.highlights.filter((item): item is string => typeof item === "string"),
      experience: candidate.experience as CvEditorExperience[],
      education: candidate.education as CvEditorEducation[],
    };
  } catch {
    return fallback;
  }
};

export const saveCvEditorData = (slug: string, data: CvEditorData) => {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(cvEditorStorageKey(slug), JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
};

export const parseEditorLines = cleanLines;
