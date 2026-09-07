import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import CvDocument from "@/components/CvDocument";
import { cvCatalog } from "@/data/cvCatalog";
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
  });

  it("keeps languages and references as independent sections", () => {
    expect(markup).toContain("<h2>LANGUAGES</h2>");
    expect(markup).toContain("<h2>REFERENCES</h2>");
    for (const language of profile.languages) {
      expect(markup).toContain(language.name);
      expect(markup).toContain(language.proficiency);
    }
  });
});
