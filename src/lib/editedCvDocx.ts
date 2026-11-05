import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import type { CvEditorData } from "@/lib/cvEditor";

const paragraph = (text: string, bold = false) => new Paragraph({ children: [new TextRun({ text, bold })] });
const section = (title: string) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(title)] });

export const downloadEditedCvDocx = async (data: CvEditorData, kind: "cv" | "resume") => {
  const children: Paragraph[] = [
    new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, children: [new TextRun({ text: data.profile.name, bold: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: [data.profile.address, data.profile.phone, data.profile.email, data.profile.linkedin].filter(Boolean).join(" | ") })] }),
    section("SUMMARY"), paragraph(data.summary),
    section("SKILLS"), ...data.skills.map(item => paragraph(item)),
    section("EXPERIENCE"),
  ];
  for (const item of data.experience) {
    children.push(paragraph(item.title, true), paragraph(item.company), paragraph([item.location,item.period].filter(Boolean).join(" | ")));
    item.contributions.forEach(line => children.push(paragraph(`• ${line}`)));
  }
  children.push(section("EDUCATION"));
  for (const item of data.education) {
    children.push(paragraph(item.school,true), paragraph([item.qualification,item.field].filter(Boolean).join(" — ")), paragraph([item.location,item.period].filter(Boolean).join(" | ")));
    if (item.description) children.push(paragraph(item.description));
  }
  children.push(section("SELECTED ACHIEVEMENTS"), ...data.highlights.map(item=>paragraph(item)));
  if (data.leadership.length) children.push(section("LEADERSHIP & VOLUNTEERING"), ...data.leadership.map(item => paragraph(item)));
  if (data.professionalStrengths.length) children.push(section("PROFESSIONAL STRENGTHS"), ...data.professionalStrengths.map(item => paragraph(item)));
  if (data.professionalDevelopment.length) children.push(section("PROFESSIONAL DEVELOPMENT"), ...data.professionalDevelopment.map(item => paragraph(item)));
  if (data.languages.length) children.push(section("LANGUAGES"), ...data.languages.map(item => paragraph(item)));
  if (data.references.trim()) children.push(section("REFERENCES"), paragraph(data.references));
  const doc = new Document({ sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 794, right: 851, bottom: 794, left: 851 } } }, children }] });
  const blob = await Packer.toBlob(doc);
  const safeName = data.profile.name.trim().replace(/[^a-z0-9]+/gi,"_").replace(/^_|_$/g,"") || "Candidate";
  const month = new Date().toISOString().slice(0,7);
  const anchor = document.createElement("a");
  const url = URL.createObjectURL(blob);
  anchor.href = url;
  anchor.download = `${safeName}_${kind.toUpperCase()}_${month}.docx`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};
