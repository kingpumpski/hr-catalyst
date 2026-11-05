import type { CvDocumentContent } from "@/data/cvDocumentContent";
import { createOriginalCvContent, formatEducationQualification } from "@/data/cvDocumentContent";
import type { CvVersion } from "@/data/cvVersions";

const STOP_WORDS = new Set([
  "the","and","for","with","that","this","from","have","has","are","you","your","our","will","who","all","any","can","not","but","was","were","their","they","them","its","into","out","over","under","about","also","more","most","such","than","then","when","what","which","while","been","being","other","across","within","upon","per","via","able","must","should","would","could","may","might","shall","each","both","some","many","much","very","well","work","working","role","job","position","candidate","applicant","company","team","teams","years","year","experience","required","requirements","responsibilities","skills","ability","strong","good","great","excellent","including","include","includes","etc","plus","new","use","using","used","support","supporting","ensure","ensuring","provide","providing","manage","managing","perform","performing",
]);

const WORD_FAMILIES: Record<string, string[]> = {
  branch: ["branch", "branches"],
  business: ["business", "businesses"],
  degree: ["degree", "degrees"],
  liaise: ["liaise", "liaises", "liaised", "liaising"],
  measure: ["measure", "measures", "measured", "measuring", "measurement", "measurements"],
  oversee: ["oversee", "oversees", "oversaw", "overseen", "overseeing"],
  qualification: ["qualification", "qualifications"],
  reconcile: ["reconcile", "reconciles", "reconciled", "reconciling", "reconciliation", "reconciliations"],
  reject: ["reject", "rejects", "rejected", "rejecting", "rejection", "rejections"],
  submit: ["submit", "submits", "submitted", "submitting", "submission", "submissions"],
  supervise: ["supervise", "supervises", "supervised", "supervising", "supervision"],
  train: ["train", "trains", "trained", "training"],
  vet: ["vet", "vets", "vetted", "vetting"],
};

const canonicalWords = new Map(
  Object.entries(WORD_FAMILIES).flatMap(([canonical, forms]) =>
    forms.map((form) => [form, canonical] as const),
  ),
);

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9+#\s-]/g, " ");

const tokenize = (value: string): string[] =>
  normalize(value)
    .split(/\s+/)
    .map((token) => token.replace(/^-+|-+$/g, ""))
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token) && !/^\d+$/.test(token));

const canonicalize = (token: string) => {
  const knownFamily = canonicalWords.get(token);
  if (knownFamily) return knownFamily;
  if (token.endsWith("ies") && token.length > 4) return token.slice(0, -3) + "y";
  if (token.endsWith("s") && token.length > 4) return token.slice(0, -1);
  return token;
};

/** Everything the exported CV/resume actually contains, as one searchable blob. */
export const buildCvCorpus = (version: CvVersion, content: CvDocumentContent = createOriginalCvContent(version)): string =>
  [
    content.name,
    content.address,
    content.email,
    content.phone,
    content.linkedin,
    content.references,
    content.summary,
    content.coreSkills.join(" "),
    content.highlights.join(" "),
    content.strengths.join(" "),
    content.companies
      .flatMap((company) => [
        company.company,
        ...company.roles.flatMap((role) => [
          role.title,
          role.location,
          role.period,
          role.summary,
          ...role.contributions,
          ...role.skills,
        ]),
      ])
      .join(" "),
    content.leadership
      .flatMap((entry) => [
        entry.title,
        entry.company,
        entry.location,
        entry.period,
        entry.summary,
        ...entry.contributions,
        ...entry.skills,
      ])
      .join(" "),
    content.education
      .flatMap((entry) => [
        entry.school,
        formatEducationQualification(entry),
        entry.period,
        entry.location,
        entry.description,
        ...(entry.coursework ?? []),
        ...(entry.activities ?? []),
      ])
      .join(" "),
    content.workshops
      .flatMap((entry) => [
        entry.title,
        entry.organization,
        entry.period,
        entry.location,
        entry.summary,
        ...entry.highlights,
        ...entry.skills,
      ])
      .join(" "),
    content.languages.map((language) => `${language.name} ${language.proficiency}`).join(" "),
  ].join(" ");

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

/**
 * Compares a pasted job description with the selected saved or draft document.
 * Common inflections are grouped (for example, "reconcile" and "reconciliation").
 */
export const analyseJobDescription = (
  jobDescription: string,
  version: CvVersion,
  content: CvDocumentContent = createOriginalCvContent(version),
): AtsAnalysis => {
  const cvWords = new Set(tokenize(buildCvCorpus(version, content)).map(canonicalize));
  const counts = new Map<string, number>();

  for (const token of tokenize(jobDescription)) {
    const key = canonicalize(token);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const terms: KeywordMatch[] = Array.from(counts.entries())
    .map(([term, count]) => ({ term, count, inCv: cvWords.has(term) }))
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term));

  const matched = terms.filter((term) => term.inCv);
  const missing = terms.filter((term) => !term.inCv);
  const score = terms.length ? Math.round((matched.length / terms.length) * 100) : 0;

  return { score, matched, missing, totalTerms: terms.length };
};

export type CvWordingSuggestion = {
  id: string;
  term: string;
  section: string;
  before: string;
  after: string;
  evidence: string;
  apply: (content: CvDocumentContent) => CvDocumentContent;
};

const educationSuggestion = (
  content: CvDocumentContent,
  term: string,
): CvWordingSuggestion | undefined => {
  if (term === "degree") {
    const index = content.education.findIndex((entry) =>
      /^Bachelor of Science(?:\s*\(BSc\))?,\s*.+$/i.test(entry.qualification),
    );
    if (index < 0) return undefined;
    const entry = content.education[index];
    const after = entry.qualification.replace(
      /^Bachelor of Science(?:\s*\(BSc\))?,\s*(.+)$/i,
      "Bachelor of Science degree (BSc) in $1",
    );
    return {
      id: `${term}-education-${index}`,
      term,
      section: `Education: ${entry.school}`,
      before: entry.qualification,
      after,
      evidence: "Uses the existing Bachelor of Science (BSc) qualification and field already recorded in this document.",
      apply: (current) => ({
        ...current,
        education: current.education.map((item, itemIndex) =>
          itemIndex === index ? { ...item, qualification: after } : item,
        ),
      }),
    };
  }

  if (term === "field") {
    const index = content.education.findIndex((entry) =>
      Boolean(entry.field) && new RegExp(`studies in ${escapeRegExp(entry.field)}`, "i").test(entry.description),
    );
    if (index < 0) return undefined;
    const entry = content.education[index];
    const after = entry.description.replace(
      new RegExp(`studies in (${escapeRegExp(entry.field)})`, "i"),
      "studies in the field of $1",
    );
    return {
      id: `${term}-education-${index}`,
      term,
      section: `Education: ${entry.school}`,
      before: entry.description,
      after,
      evidence: `Makes the existing field of study (${entry.field}) explicit without adding a new qualification.`,
      apply: (current) => ({
        ...current,
        education: current.education.map((item, itemIndex) =>
          itemIndex === index ? { ...item, description: after } : item,
        ),
      }),
    };
  }
  return undefined;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const rephraseCoordinationAsLiaison = (value: string) =>
  value.replace(/\b(coordinated|coordinates|coordinate)(\s+daily)?\s+with\b/i, (_match, verb: string, daily = "") => {
    const replacements: Record<string, string> = {
      coordinated: "Liaised",
      coordinates: "Liaises",
      coordinate: "Liaise",
    };
    const replacement = replacements[verb.toLowerCase()];
    return `${verb[0] === verb[0].toUpperCase() ? replacement : replacement.toLowerCase()}${daily} with`;
  });

const roleSuggestion = (
  content: CvDocumentContent,
  term: "liaise" | "oversee" | "vet",
): CvWordingSuggestion | undefined => {
  if (term === "vet") {
    for (let companyIndex = 0; companyIndex < content.companies.length; companyIndex += 1) {
      const company = content.companies[companyIndex];
      for (let roleIndex = 0; roleIndex < company.roles.length; roleIndex += 1) {
        const role = company.roles[roleIndex];
        const contributionIndex = role.contributions.findIndex((contribution) =>
          /claims processing/i.test(contribution) &&
          /reviewed documentation for accuracy, completeness, and compliance/i.test(contribution),
        );
        if (contributionIndex < 0) continue;
        const before = role.contributions[contributionIndex];
        const after = before.replace(
          /reviewed documentation for accuracy, completeness, and compliance/i,
          "vetted claims documentation for accuracy, completeness, and compliance",
        );
        return {
          id: `vet-company-${companyIndex}-role-${roleIndex}-contribution-${contributionIndex}`,
          term,
          section: `${role.title} — ${company.company}`,
          before,
          after,
          evidence: "Rephrases an existing claims-document review duty using its established accuracy, completeness, and compliance checks.",
          apply: (current) => ({
            ...current,
            companies: current.companies.map((currentCompany, currentCompanyIndex) =>
              currentCompanyIndex !== companyIndex
                ? currentCompany
                : {
                    ...currentCompany,
                    roles: currentCompany.roles.map((currentRole, currentRoleIndex) =>
                      currentRoleIndex !== roleIndex
                        ? currentRole
                        : {
                            ...currentRole,
                            contributions: currentRole.contributions.map((contribution, currentContributionIndex) =>
                              currentContributionIndex === contributionIndex ? after : contribution,
                            ),
                          },
                    ),
                  },
            ),
          }),
        };
      }
    }
    return undefined;
  }

  if (term === "liaise" || term === "oversee") {
    const pattern = term === "liaise"
      ? /\bcoordinate(?:d|s)?(?:\s+daily)?\s+with\b/i
      : /\blead end-to-end\b/i;
    const highlightIndex = content.highlights.findIndex((highlight) => pattern.test(highlight));
    if (highlightIndex >= 0) {
      const before = content.highlights[highlightIndex];
      const after = term === "liaise"
        ? rephraseCoordinationAsLiaison(before)
        : before.replace(/\blead end-to-end\b/i, "Oversee end-to-end");
      return {
        id: `${term}-highlight-${highlightIndex}`,
        term,
        section: "Selected achievements",
        before,
        after,
        evidence: term === "liaise"
          ? "Rephrases existing coordination with named stakeholders; it does not add a new responsibility."
          : "Rephrases an existing end-to-end leadership duty; it does not add a new responsibility.",
        apply: (current) => ({
          ...current,
          highlights: current.highlights.map((highlight, index) => index === highlightIndex ? after : highlight),
        }),
      };
    }
  }

  for (let companyIndex = 0; companyIndex < content.companies.length; companyIndex += 1) {
    const company = content.companies[companyIndex];
    for (let roleIndex = 0; roleIndex < company.roles.length; roleIndex += 1) {
      const role = company.roles[roleIndex];
      for (let contributionIndex = 0; contributionIndex < role.contributions.length; contributionIndex += 1) {
        const before = role.contributions[contributionIndex];
        const pattern = term === "liaise"
          ? /\bcoordinate(?:d|s)?(?:\s+daily)?\s+with\b/i
          : /\blead end-to-end\b/i;
        if (!pattern.test(before)) continue;
        const after = term === "liaise"
          ? rephraseCoordinationAsLiaison(before)
          : before.replace(/\blead end-to-end\b/i, "Oversee end-to-end");
        return {
          id: `${term}-company-${companyIndex}-role-${roleIndex}-contribution-${contributionIndex}`,
          term,
          section: `${role.title} — ${company.company}`,
          before,
          after,
          evidence: term === "liaise"
            ? "Rephrases an existing coordination duty; it does not add a new responsibility."
            : "Rephrases an existing end-to-end leadership duty; it does not add a new responsibility.",
          apply: (current) => ({
            ...current,
            companies: current.companies.map((currentCompany, currentCompanyIndex) =>
              currentCompanyIndex !== companyIndex
                ? currentCompany
                : {
                    ...currentCompany,
                    roles: currentCompany.roles.map((currentRole, currentRoleIndex) =>
                      currentRoleIndex !== roleIndex
                        ? currentRole
                        : {
                            ...currentRole,
                            contributions: currentRole.contributions.map((contribution, currentContributionIndex) =>
                              currentContributionIndex === contributionIndex ? after : contribution,
                            ),
                          },
                    ),
                  },
            ),
          }),
        };
      }
    }
  }
  return undefined;
};

/** Only returns keyword suggestions that can be grounded in existing CV text. */
export const getSupportedCvWordingSuggestions = (
  content: CvDocumentContent,
  missingTerms: string[],
): CvWordingSuggestion[] => {
  const suggestions: CvWordingSuggestion[] = [];
  for (const term of missingTerms) {
    const suggestion = educationSuggestion(content, term) ??
    (term === "liaise" || term === "oversee" || term === "vet" ? roleSuggestion(content, term) : undefined);
    if (suggestion && !suggestions.some(({ id }) => id === suggestion.id)) suggestions.push(suggestion);
  }
  return suggestions;
};
