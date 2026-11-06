import {
  AlignmentType, BorderStyle, Document, HeadingLevel, LevelFormat, Packer, Paragraph, TextRun,
} from "docx";
import type { CvEditorData } from "@/lib/cvEditor";
import { getCvFormatProfile } from "@/data/cvFormatProfiles";
import { loadDocumentSettings } from "@/lib/documentSettings";

const FONT = "Times New Roman";
const PAGE_SIZES = {
  A4: { width: 11906, height: 16838 },
  Letter: { width: 12240, height: 15840 },
} as const;
const PAGE_MARGIN = { top: 794, right: 851, bottom: 794, left: 851 };

const numbering = {
  config: [{
    reference: "edited-cv-bullets",
    levels: [{
      level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 340, hanging: 200 } } },
    }],
  }],
};
const styles = {
  default: { document: { run: { font: FONT, size: 21, color: "111111" }, paragraph: { spacing: { after: 40 } } } },
  paragraphStyles: [
    {
      id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { font: FONT, size: 46, bold: true, color: "111111" },
      paragraph: { alignment: AlignmentType.CENTER, spacing: { after: 70 }, outlineLevel: 0 },
    },
    {
      id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { font: FONT, size: 23, bold: true, color: "111111" },
      paragraph: {
        spacing: { before: 190, after: 90 }, outlineLevel: 1, keepNext: true,
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "777777", space: 1 } },
      },
    },
  ],
};
const sectionHeading = (value: string) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  children: [new TextRun({ text: value, font: FONT, bold: true })],
});
const body = (value: string, options: { bold?: boolean; italics?: boolean; size?: number; after?: number; before?: number } = {}) =>
  new Paragraph({
    spacing: { before: options.before ?? 0, after: options.after ?? 45 },
    keepLines: true,
    children: [new TextRun({ text: value, font: FONT, bold: options.bold, italics: options.italics, size: options.size })],
  });
const bullet = (value: string) => new Paragraph({
  numbering: { reference: "edited-cv-bullets", level: 0 },
  spacing: { after: 35 }, keepLines: true,
  children: [new TextRun({ text: value, font: FONT, size: 21 })],
});
const appendEntry = (
  children: Paragraph[], title: string, organization: string, location: string, period: string, details: string[],
) => {
  if (title.trim()) children.push(body(title.trim(), { bold: true, before: 95, after: 15 }));
  if (organization.trim()) children.push(body(organization.trim(), { italics: true, after: 15 }));
  const meta = [location.trim(), period.trim()].filter(Boolean).join(" | ");
  if (meta) children.push(body(meta, { size: 18, after: 55 }));
  details.map((item) => item.trim()).filter(Boolean).forEach((item) => children.push(bullet(item)));
};
const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** Word export mirrors the live editor preview: same sections, order, labels and single-column reading flow. */
export const downloadEditedCvDocx = async (data: CvEditorData, kind: "cv" | "resume") => {
  const settings = loadDocumentSettings();
  const format = getCvFormatProfile(settings.targetMarket);
  const pageSize = PAGE_SIZES[format.paperSize] ?? PAGE_SIZES.A4;
  const contact = [
    settings.showLocation ? data.profile.address : "",
    settings.showContactDetails ? data.profile.phone : "",
    settings.showContactDetails ? data.profile.email : "",
    settings.includeLinkedIn && settings.showContactDetails ? data.profile.linkedin.replace(/^https?:\/\//, "") : "",
  ].map((item) => item.trim()).filter(Boolean);

  const children: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: data.profile.name.trim(), font: FONT, bold: true, size: 46 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 160 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "777777", space: 4 } },
      children: [new TextRun({ text: contact.join(" | "), font: FONT, size: 18 })],
    }),
  ];

  const appendListSection = (title: string, items: string[]) => {
    const visible = items.map((item) => item.trim()).filter(Boolean);
    if (visible.length) children.push(sectionHeading(title), ...visible.map(bullet));
  };
  if (data.summary.trim()) children.push(sectionHeading("SUMMARY"), body(data.summary.trim(), { after: 65 }));
  appendListSection("SKILLS", data.skills);
  if (data.experience.length) {
    children.push(sectionHeading("EXPERIENCE"));
    for (const item of data.experience) appendEntry(children, item.title, item.company, item.location, item.period, item.contributions);
  }
  if (data.education.length) {
    children.push(sectionHeading("EDUCATION"));
    for (const item of data.education) appendEntry(children, item.school, [item.qualification, item.field].filter(Boolean).join(" — "), item.location, item.period, item.description ? [item.description] : []);
  }
  appendListSection("SELECTED ACHIEVEMENTS", data.highlights);
  appendListSection("LEADERSHIP & VOLUNTEERING", data.leadership);
  appendListSection("PROFESSIONAL STRENGTHS", data.professionalStrengths);
  appendListSection("PROFESSIONAL DEVELOPMENT", data.professionalDevelopment);
  appendListSection("LANGUAGES", data.languages);
  if (settings.showReferences && data.references.trim()) {
    children.push(sectionHeading("REFERENCES"), body(data.references.trim()));
  }

  const doc = new Document({
    styles, numbering,
    sections: [{ properties: { page: { size: pageSize, margin: PAGE_MARGIN } }, children }],
  });
  const blob = await Packer.toBlob(doc);
  const safeName = data.profile.name.trim().replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "Candidate";
  const month = new Date().toISOString().slice(0, 7);
  downloadBlob(blob, safeName + "_" + kind.toUpperCase() + "_" + month + ".docx");
};
