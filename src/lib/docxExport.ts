import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  LevelFormat,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

import type { CvVersion } from "@/data/cvVersions";
import { createOriginalCvContent, type CvDocumentContent } from "@/data/cvDocumentContent";
import { getRecruiterDocumentFilename } from "@/lib/recruiterDocument";
import { buildCoverLetter, type CoverLetterInputs } from "@/lib/coverLetter";
import { loadDocumentSettings } from "@/lib/documentSettings";
import { getCvFormatProfile } from "@/data/cvFormatProfiles";

const FONT = "Times New Roman";

const PAGE_SIZES = {
  A4: { width: 11906, height: 16838 },
  Letter: { width: 12240, height: 15840 },
} as const;

const MARGIN = { top: 794, right: 851, bottom: 794, left: 851 }; // ~14mm / 15mm

const numbering = {
  config: [
    {
      reference: "cv-bullets",
      levels: [
        {
          level: 0,
          format: LevelFormat.BULLET,
          text: "\u2022",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 340, hanging: 200 } } },
        },
      ],
    },
  ],
};

const styles = {
  default: { document: { run: { font: FONT, size: 21 } } },
  paragraphStyles: [
    {
      id: "Heading1",
      name: "Heading 1",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: { size: 46, bold: true, font: FONT },
      paragraph: { spacing: { after: 80 }, alignment: AlignmentType.CENTER, outlineLevel: 0 },
    },
    {
      id: "Heading2",
      name: "Heading 2",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: { size: 23, bold: true, font: FONT },
      paragraph: {
        spacing: { before: 200, after: 80 },
        outlineLevel: 1,
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "777777", space: 1 } },
      },
    },
  ],
};

const bullet = (text: string) =>
  new Paragraph({ numbering: { reference: "cv-bullets", level: 0 }, children: [new TextRun(text)] });

const body = (text: string, opts: { bold?: boolean; italics?: boolean; after?: number } = {}) =>
  new Paragraph({
    spacing: { after: opts.after ?? 40 },
    children: [new TextRun({ text, bold: opts.bold, italics: opts.italics })],
  });

const heading = (text: string) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] });

const entryHeader = (title: string, org: string, meta: string) => [
  new Paragraph({ spacing: { before: 100 }, children: [new TextRun({ text: title, bold: true })] }),
  new Paragraph({ children: [new TextRun({ text: org, italics: true })] }),
  new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: meta, size: 18 })] }),
];

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const buildContactLine = (content: CvDocumentContent) => {
  const settings = loadDocumentSettings();
  const parts = [
    settings.showLocation ? content.address : "",
    settings.showContactDetails ? content.phone : "",
    settings.showContactDetails ? content.email : "",
    settings.includeLinkedIn && settings.showContactDetails ? content.linkedin.replace(/^https?:\/\//, "") : "",
  ].filter(Boolean);
  return parts.join(" | ");
};

/** Word export of the CV / resume, mirroring the on-screen ATS document. */
export const downloadCvDocx = async (
  version: CvVersion,
  documentType: "cv" | "resume" = "cv",
  content: CvDocumentContent = createOriginalCvContent(version),
) => {
  const settings = loadDocumentSettings();
  const format = getCvFormatProfile(settings.targetMarket);
  const size = PAGE_SIZES[format.paperSize] ?? PAGE_SIZES.A4;

  const children: Paragraph[] = [
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(content.name)] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "777777", space: 4 } },
      children: [new TextRun({ text: buildContactLine(content), size: 18 })],
    }),
    heading("SUMMARY"),
    body(content.summary),
    heading("SKILLS"),
    ...Array.from(new Set(content.coreSkills)).map(bullet),
    heading("EXPERIENCE"),
  ];

  for (const company of content.companies) {
    for (const role of company.roles) {
      children.push(...entryHeader(role.title, company.company, `${role.location} | ${role.period}`));
      if (role.summary) children.push(body(role.summary));
      children.push(...role.contributions.map(bullet));
      if (role.skills.length) children.push(body(`Skills: ${role.skills.join(", ")}`));
    }
  }

  children.push(heading("EDUCATION"));
  for (const entry of content.education) {
    children.push(
      ...entryHeader(
        entry.school,
        `${entry.qualification}${entry.field ? ` — ${entry.field}` : ""}`,
        `${entry.location} | ${entry.period}`,
      ),
    );
    if (entry.description) children.push(bullet(entry.description));
    if (entry.coursework?.length) children.push(bullet(`Relevant coursework: ${entry.coursework.join(", ")}`));
    entry.activities?.forEach((activity) => children.push(bullet(activity)));
  }

  children.push(heading("SELECTED ACHIEVEMENTS"), ...content.highlights.map(bullet));

  if (content.leadership.length) {
    children.push(heading("LEADERSHIP & FINANCIAL ACCOUNTABILITY"));
    for (const entry of content.leadership) {
      children.push(...entryHeader(entry.title, entry.company, `${entry.location} | ${entry.period}`));
      if (entry.summary) children.push(body(entry.summary));
      children.push(...entry.contributions.slice(0, 5).map(bullet));
    }
  }

  children.push(heading("PROFESSIONAL STRENGTHS"), ...content.strengths.map(bullet));

  if (content.workshops.length) {
    children.push(heading("PROFESSIONAL DEVELOPMENT"));
    for (const item of content.workshops) {
      children.push(bullet(`${item.title} — ${item.organization}, ${item.period}${item.location ? ` | ${item.location}` : ""}`));
      if (item.summary) children.push(body(item.summary));
      children.push(...item.highlights.map(bullet));
    }
  }

  children.push(heading("LANGUAGES"), ...content.languages.map((language) => bullet(`${language.name} — ${language.proficiency}`)));

  if (settings.showReferences) {
    children.push(heading("REFERENCES"), body(content.references));
  }

  const doc = new Document({
    styles,
    numbering,
    sections: [{ properties: { page: { size, margin: MARGIN } }, children }],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${getRecruiterDocumentFilename(content.name, documentType)}.docx`);
};

/** Word export of the tailored cover letter. */
export const downloadCoverLetterDocx = async (version: CvVersion, inputs: CoverLetterInputs = {}) => {
  const letter = buildCoverLetter(version, inputs);
  const originalContent = createOriginalCvContent(version);
  const settings = loadDocumentSettings();
  const format = getCvFormatProfile(settings.targetMarket);
  const size = PAGE_SIZES[format.paperSize] ?? PAGE_SIZES.A4;
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const children: Paragraph[] = [
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(originalContent.name)] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [new TextRun({ text: buildContactLine(originalContent), size: 18 })],
    }),
    body(today, { after: 200 }),
    body(letter.recipientName),
    body(letter.employerName),
    body(letter.companyAddress, { after: 200 }),
    body(letter.subject, { bold: true, after: 200 }),
    body(letter.greeting, { after: 160 }),
    ...letter.paragraphs.map((paragraph) => body(paragraph, { after: 160 })),
    body("Yours sincerely,", { after: 320 }),
    body(letter.signOff, { bold: true }),
  ];

  const doc = new Document({
    styles,
    numbering,
    sections: [{ properties: { page: { size, margin: MARGIN } }, children }],
  });

  const blob = await Packer.toBlob(doc);
  const employerSlug = letter.employerName.replace(/[^A-Za-z0-9 ]/g, "").trim() || "Application";
  downloadBlob(blob, `Kingsley Junior Norku - Cover Letter - ${employerSlug}.docx`);
};
