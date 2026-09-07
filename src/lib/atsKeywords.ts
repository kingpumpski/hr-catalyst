import type { CvVersion } from "@/data/cvVersions";
import { companies, leadership, profile, workshopsAndSeminars } from "@/data/profile";
import { education } from "@/data/education";

const STOP_WORDS = new Set([
  "the","and","for","with","that","this","from","have","has","are","you","your","our","will","who","all","any","can","not","but","was","were","their","they","them","its","into","out","over","under","about","also","more","most","such","than","then","when","what","which","while","been","being","other","across","within","upon","per","via","able","must","should","would","could","may","might","shall","each","both","some","many","much","very","well","work","working","role","job","position","candidate","applicant","company","team","teams","years","year","experience","required","requirements","responsibilities","skills","ability","strong","good","great","excellent","including","include","includes","etc","plus","new","use","using","used","support","supporting","ensure","ensuring","provide","providing","manage","managing","perform","performing",
]);

export type KeywordMatch = {
  term: string;
  count: number;
  inCv: boolean;
};

export type AtsAnalysis = {
  score: number;
  matched: KeywordMatch[];
  missing: KeywordMatch[];
  totalTerms: number;
};

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9+#\s-]/g, " ");

const tokenize = (value: string): string[] =>
  normalize(value)
    .split(/\s+/)
    .map((token) => token.replace(/^-+|-+$/g, ""))
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token) && !/^\d+$/.test(token));

/** Everything the exported CV/resume actually contains, as one searchable blob. */
export const buildCvCorpus = (version: CvVersion): string =>
  [
    profile.name,
    profile.headline,
    version.summary,
    version.coreSkills.join(" "),
    version.highlights.join(" "),
    version.keywords.join(" "),
    companies
      .flatMap((company) => [company.company, ...company.roles.flatMap((role) => [role.title, role.summary, ...role.contributions, ...role.skills])])
      .join(" "),
    leadership.flatMap((entry) => [entry.title, entry.company, ...entry.contributions]).join(" "),
    education.flatMap((entry) => [entry.school, entry.qualification, entry.field, entry.description, ...(entry.coursework ?? [])]).join(" "),
    workshopsAndSeminars.flatMap((entry) => [entry.title, entry.organization, entry.summary, ...entry.skills]).join(" "),
  ].join(" ");

const singular = (term: string) => (term.endsWith("s") && term.length > 4 ? term.slice(0, -1) : term);

/**
 * Compares a pasted job description with the selected CV version and reports
 * which meaningful terms are already covered and which are missing.
 */
export const analyseJobDescription = (jobDescription: string, version: CvVersion): AtsAnalysis => {
  const corpus = ` ${normalize(buildCvCorpus(version))} `;
  const counts = new Map<string, number>();

  for (const token of tokenize(jobDescription)) {
    const key = singular(token);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const terms: KeywordMatch[] = Array.from(counts.entries())
    .map(([term, count]) => ({ term, count, inCv: corpus.includes(` ${term}`) || corpus.includes(`${term} `) }))
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term));

  const matched = terms.filter((term) => term.inCv);
  const missing = terms.filter((term) => !term.inCv);
  const score = terms.length ? Math.round((matched.length / terms.length) * 100) : 0;

  return { score, matched, missing, totalTerms: terms.length };
};
