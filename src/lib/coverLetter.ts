import type { CvVersion } from "@/data/cvVersions";
import { profile } from "@/data/profile";

export type CoverLetterInputs = {
  recipientName?: string;
  employerName?: string;
  companyAddress?: string;
  jobTitle?: string;
  jobReference?: string;
};

export type BuiltCoverLetter = {
  recipientName: string;
  employerName: string;
  companyAddress: string;
  subject: string;
  greeting: string;
  paragraphs: string[];
  signOff: string;
};

const clean = (value?: string) => (value ?? "").trim();

/**
 * Builds a tailored cover letter from the selected CV version plus the
 * employer / job title the user typed. The base copy of each version stays the
 * source of truth; employer-specific sentences are woven around it.
 */
export const buildCoverLetter = (
  version: CvVersion,
  inputs: CoverLetterInputs = {},
): BuiltCoverLetter => {
  const recipientName = clean(inputs.recipientName) || "Hiring Manager";
  const employerName = clean(inputs.employerName) || "[Company Name]";
  const companyAddress = clean(inputs.companyAddress) || "[Company Address]";
  const jobTitle = clean(inputs.jobTitle) || version.title;
  const reference = clean(inputs.jobReference);

  const subject = reference
    ? `Re: Application for the ${jobTitle} position (Ref: ${reference})`
    : `Re: Application for the ${jobTitle} position`;

  const topSkills = version.coreSkills.slice(0, 4).join(", ");

  const opening = `I am writing to apply for the ${jobTitle} position at ${employerName}. ${version.coverLetter.opening}`;

  const fitParagraph = `What I would bring to ${employerName} is direct, hands-on strength in ${topSkills}. ${version.highlights[0] ?? ""}`.trim();

  const closing = `${version.coverLetter.closing} I would welcome the opportunity to discuss how my experience supports the goals of ${employerName} in the ${jobTitle} role.`;

  return {
    recipientName,
    employerName,
    companyAddress,
    subject,
    greeting: `Dear ${recipientName},`,
    paragraphs: [opening, ...version.coverLetter.body, fitParagraph, closing, "Thank you for your time and consideration."],
    signOff: profile.name,
  };
};
