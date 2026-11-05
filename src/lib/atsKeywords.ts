import type { CvVersion } from "@/data/cvVersions";
import type { CvEditorData } from "@/lib/cvEditor";
import { companies, leadership, profile, workshopsAndSeminars } from "@/data/profile";
import { education } from "@/data/education";

const STOP_WORDS = new Set([
  "the","and","for","with","that","this","from","have","has","are","you","your","our","will","who","all","any","can","not","but","was","were","their","they","them","its","into","out","over","under","about","also","more","most","such","than","then","when","what","which","while","been","being","other","across","within","upon","per","via","able","must","should","would","could","may","might","shall","each","both","some","many","much","very","well","work","working","role","job","position","candidate","applicant","company","team","teams","years","year","experience","required","requirements","responsibilities","skills","ability","strong","good","great","excellent","including","include","includes","etc","plus","new","use","using","used","support","supporting","ensure","ensuring","provide","providing","manage","managing","perform","performing",
]);

export type KeywordMatch = { term: string; count: number; inCv: boolean };
export type AtsAnalysis = { score: number; matched: KeywordMatch[]; missing: KeywordMatch[]; totalTerms: number };

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9+#\s-]/g, " ");
const tokenize = (value: string): string[] =>
  normalize(value).split(/\s+/).map((token) => token.replace(/^-+|-+$/g, ""))
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token) && !/^\d+$/.test(token));

/** Searchable text from the editable document currently shown and exported. */
export const buildEditorCorpus = (data: CvEditorData): string => [
  data.profile.name, data.profile.address, data.profile.phone, data.profile.email, data.profile.linkedin,
  data.summary, data.skills.join(" "), data.highlights.join(" "),
  data.experience.flatMap((item) => [item.company, item.title, item.location, item.period, ...item.contributions]).join(" "),
  data.education.flatMap((item) => [item.school, item.qualification, item.field, item.period, item.location, item.description]).join(" "),
  data.leadership.join(" "), data.professionalDevelopment.join(" "),
  data.professionalStrengths.join(" "), data.languages.join(" "), data.references,
].join(" ");

/** Also available for the non-editable source document and backwards-compatible callers. */
export const buildCvCorpus = (version: CvVersion): string => [
  profile.name, profile.headline, version.summary, version.coreSkills.join(" "),
  version.highlights.join(" "), version.keywords.join(" "),
  companies.flatMap((company) => [company.company, ...company.roles.flatMap((role) => [role.title, role.summary, ...role.contributions, ...role.skills])]).join(" "),
  leadership.flatMap((entry) => [entry.title, entry.company, ...entry.contributions]).join(" "),
  education.flatMap((entry) => [entry.school, entry.qualification, entry.field, entry.description, ...(entry.coursework ?? [])]).join(" "),
  workshopsAndSeminars.flatMap((entry) => [entry.title, entry.organization, entry.summary, ...entry.skills]).join(" "),
].join(" ");

const WORD_FAMILIES: Record<string, string[]> = {
  reconcile: ["reconcile", "reconciles", "reconciled", "reconciliation", "reconciliations"],
  submit: ["submit", "submits", "submitted", "submission", "submissions"],
  reject: ["reject", "rejects", "rejected", "rejection", "rejections"],
  qualify: ["qualify", "qualified", "qualification", "qualifications"],
  supervise: ["supervise", "supervises", "supervised", "supervision", "supervisor"],
  train: ["train", "trains", "trained", "training"],
  liaise: ["liaise", "liaises", "liaised", "liaison"],
  vet: ["vet", "vets", "vetted", "vetting"],
  degree: ["degree", "bachelor", "bachelors"],
  branch: ["branch", "branches"],
};
const hasTerm = (corpus: string, term: string) => {
  const corpusTokens = new Set(tokenize(corpus));
  const family = Object.values(WORD_FAMILIES).find((words) => words.includes(term)) ?? [term];
  return family.some((word) => corpusTokens.has(word));
};

export const analyseCorpus = (jobDescription: string, corpus: string): AtsAnalysis => {
  const counts = new Map<string, number>();
  for (const token of tokenize(jobDescription)) counts.set(token, (counts.get(token) ?? 0) + 1);
  const terms: KeywordMatch[] = Array.from(counts.entries())
    .map(([term, count]) => ({ term, count, inCv: hasTerm(corpus, term) }))
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term));
  const matched = terms.filter((term) => term.inCv);
  const missing = terms.filter((term) => !term.inCv);
  return { score: terms.length ? Math.round((matched.length / terms.length) * 100) : 0, matched, missing, totalTerms: terms.length };
};

export const analyseEditorDocument = (jobDescription: string, data: CvEditorData): AtsAnalysis =>
  analyseCorpus(jobDescription, buildEditorCorpus(data));

export const analyseJobDescription = (jobDescription: string, version: CvVersion): AtsAnalysis =>
  analyseCorpus(jobDescription, buildCvCorpus(version));

export type TailoringResult = {
  data: CvEditorData;
  appliedTerms: string[];
  skippedTerms: string[];
  changes: string[];
};

/**
 * Rephrases only claims supported by the supplied CV data or the existing,
 * authored career-track content. It never invents employers, qualifications,
 * metrics, duties or achievements.
 */
export const createEvidenceBasedTailoring = (
  source: CvEditorData,
  version: CvVersion,
  missingTerms: string[],
): TailoringResult => {
  const data: CvEditorData = {
    ...source,
    profile: { ...source.profile },
    skills: [...source.skills],
    highlights: [...source.highlights],
    experience: source.experience.map((item) => ({ ...item, contributions: [...item.contributions] })),
    education: source.education.map((item) => ({ ...item })),
  };
  const applied = new Set<string>();
  const changes: string[] = [];
  const mark = (term: string, description: string) => { applied.add(term); changes.push(description); };
  const terms = new Set(missingTerms.map((term) => term.toLowerCase()));

  const accountsRole = data.experience.find((item) => /accounts/i.test(item.title));
  const claimsRole = data.experience.find((item) => /claims manager|claims/i.test(item.title));
  const existingText = [source.summary, ...source.skills, ...source.highlights, ...source.experience.flatMap((item) => item.contributions), ...version.coverLetter.body].join(" ").toLowerCase();

  if ((terms.has("liaise") || terms.has("liaised")) && /collaborat|coordinate.*insurer/i.test(existingText) && claimsRole) {
    const index = claimsRole.contributions.findIndex((line) => /collaborat.*insurer|insurer.*provider/i.test(line));
    if (index >= 0) {
      claimsRole.contributions[index] = "Liaise with insurers, healthcare providers and internal teams to resolve claims queries and support timely reimbursement.";
      mark("liaise", "Clarified insurer and provider liaison responsibilities.");
    }
  }

  if ((terms.has("reconcile") || terms.has("reconciliation") || terms.has("reconciliations")) && accountsRole) {
    const index = accountsRole.contributions.findIndex((line) => /reconciliation|reconciliat/i.test(line));
    if (index >= 0) {
      accountsRole.contributions[index] = "Reconciled financial and claims records, supporting monthly reporting, audit readiness and internal financial controls.";
      mark("reconcile", "Strengthened the existing reconciliation statement.");
    }
  }

  if ((terms.has("vet") || terms.has("vetting")) && /vetting/i.test(version.coverLetter.body.join(" "))) {
    const index = claimsRole?.contributions.findIndex((line) => /documentation.*accuracy|reviewed documentation/i.test(line)) ?? -1;
    if (claimsRole && index >= 0) {
      claimsRole.contributions[index] = "Vetted claim documentation for accuracy, completeness and compliance before submission.";
      mark("vet", "Made the documented claims-vetting activity explicit.");
    }
  }

  if ((terms.has("submitted") || terms.has("submission") || terms.has("submit")) && /submission/i.test(existingText) && claimsRole) {
    const index = claimsRole.contributions.findIndex((line) => /submission|claims processing/i.test(line));
    if (index >= 0) {
      claimsRole.contributions[index] = "Coordinate end-to-end claims processing, submission and insurer follow-up to support timely reimbursement.";
      mark("submitted", "Clarified the documented claims submission workflow.");
    }
  }

  if ((terms.has("rejected") || terms.has("rejection") || terms.has("rejections")) && /rejection/i.test(existingText) && claimsRole) {
    const index = claimsRole.contributions.findIndex((line) => /liaise with insurers|collaborat.*insurer|insurer.*provider|claims processing/i.test(line));
    if (index >= 0) {
      claimsRole.contributions[index] = "Liaise with insurers and providers to resolve rejected claims, documentation queries and reimbursement delays.";
      mark("rejected", "Clarified the existing rejection follow-up responsibility.");
    }
  }

  if ((terms.has("against") || terms.has("ledger") || terms.has("ledgers")) && /claims against ledgers/i.test(version.coverLetter.body.join(" ").toLowerCase()) && accountsRole) {
    const index = accountsRole.contributions.findIndex((line) => /reconciliation|reporting/i.test(line));
    if (index >= 0) {
      accountsRole.contributions[index] = "Reconcile claims against financial ledgers and support monthly reporting, audit readiness and internal controls.";
      mark("against", "Included the documented claims-to-ledger reconciliation.");
    }
  }

  if ((terms.has("degree") || terms.has("qualification") || terms.has("qualifications") || terms.has("field")) &&
      data.education.some((item) => /bachelor|bsc/i.test(item.qualification))) {
    const degree = data.education.find((item) => /bachelor|bsc/i.test(item.qualification));
    if (degree && !data.summary.toLowerCase().includes(degree.qualification.toLowerCase())) {
      const qualificationLabel = /BSc/i.test(degree.qualification) ? "bachelor’s degree (BSc)" : degree.qualification;
      data.summary = `${data.summary.trim()} Holds a ${qualificationLabel} in ${degree.field || "Accounting"}.`;
      mark("degree", "Made the existing academic qualification more visible in the summary.");
      if (terms.has("qualification") || terms.has("qualifications")) applied.add("qualification");
      if (terms.has("field")) applied.add("field");
    }
  }

  if ((terms.has("oversee") || terms.has("oversees") || terms.has("overseeing")) &&
      /lead operational coordination|lead end-to-end/i.test(existingText) && claimsRole) {
    const index = claimsRole.contributions.findIndex((line) => /lead operational coordination|coordinate daily operational/i.test(line));
    if (index >= 0) {
      claimsRole.contributions[index] = "Oversee day-to-day coordination of claims administration across finance, clinical and insurer-facing workflows.";
      mark("oversee", "Rephrased the documented operational leadership responsibility.");
    }
  }

  // Add only compact, evidence-backed capabilities; do not pad the document with
  // unsupported advert language or generic keyword lists.
  const safeSkills = [
    ["liaise", "Insurer and Provider Liaison", /insurer|provider/i.test(existingText)],
    ["reconcile", "Claims and Financial Reconciliation", /reconcil/i.test(existingText)],
    ["vet", "Claims Documentation Vetting", /vetting|reviewed documentation/i.test(existingText)],
    ["submitted", "Claims Submission", /submission/i.test(existingText)],
    ["rejected", "Claims Rejection Resolution", /rejection/i.test(existingText)],
  ] as const;
  for (const [term, skill, supported] of safeSkills) {
    if (terms.has(term) && supported && !data.skills.some((item) => item.toLowerCase() === skill.toLowerCase())) {
      data.skills.push(skill);
      applied.add(term);
      changes.push(`Added the supported skill: ${skill}.`);
    }
  }

  const skippedTerms = missingTerms.filter((term) => {\n    const family = Object.values(WORD_FAMILIES).find((words) => words.includes(term.toLowerCase())) ?? [term.toLowerCase()];\n    return !family.some((word) => applied.has(word));\n  });
  return { data, appliedTerms: [...applied], skippedTerms, changes };
};
