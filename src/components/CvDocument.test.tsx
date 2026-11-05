import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import CvDocument from "@/components/CvDocument";
import { cvCatalog } from "@/data/cvCatalog";
import { createOriginalCvContent } from "@/data/cvDocumentContent";
import { profile } from "@/data/profile";

describe("CvDocument ATS export structure", () => {
  const version = cvCatalog[0];
  const markup = renderToStaticMarkup(<CvDocument version={version} documentType="cv" />);

  it("keeps internal application identity out of the recruiter-facing header", () => {
    const header = markup.split("<section>")[0];
    expect(header).toContain(profile.name);
    expect(header).not.toContain(profile.headline);
    expect(header).not.toContain(version.title);
    expect(header).not.toContain(version.targetRoles);
  });

  it("renders the skills section as two ordinary bulleted lists", () => {
    const skillsSection = markup.match(/<section><h2>SKILLS<\/h2>([\s\S]*?)<\/section>/)?.[1] ?? "";
    const readableSkillsSection = skillsSection.replaceAll("&amp;", "&");
    expect(skillsSection).toContain('class="cv-skill-grid"');
    expect((skillsSection.match(/<ul/g) ?? []).length).toBe(2);
    for (const skill of version.coreSkills) {
      expect(readableSkillsSection).toContain(skill);
    }
  });

  it("uses aligned entry metadata for experience and education", () => {
    expect(markup).toContain("<h2>EXPERIENCE</h2>");
    expect(markup).toContain("<h2>EDUCATION</h2>");
    expect(markup).toContain('class="cv-entry-primary"');
    expect(markup).toContain('class="cv-entry-meta"');
    expect(markup).toContain("Qualification: Bachelor of Science (BSc) — Field: Accounting");
  });

  it("keeps languages and references as independent sections", () => {
    expect(markup).toContain("<h2>LANGUAGES</h2>");
    expect(markup).toContain("<h2>REFERENCES</h2>");
    for (const language of profile.languages) {
      expect(markup).toContain(language.name);
      expect(markup).toContain(language.proficiency);
    }
  });

  it("renders edited profile, dates, locations, descriptions, skills, and achievements", () => {
    const content = createOriginalCvContent(version);
    content.name = "Updated Name";
    content.companies[0].roles[0].period = "January 2025 - Present";
    content.companies[0].roles[0].location = "Remote";
    content.companies[0].roles[0].summary = "User-entered role description.";
    content.education[0].location = "Updated education location";
    content.coreSkills = ["User-entered skill"];
    content.highlights = ["User-entered achievement"];

    const editedMarkup = renderToStaticMarkup(<CvDocument version={version} content={content} />);
    expect(editedMarkup).toContain("Updated Name");
    expect(editedMarkup).toContain("January 2025 - Present");
    expect(editedMarkup).toContain("Remote");
    expect(editedMarkup).toContain("User-entered role description.");
    expect(editedMarkup).toContain("Updated education location");
    expect(editedMarkup).toContain("User-entered skill");
    expect(editedMarkup).toContain("User-entered achievement");
  });
});
