import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import EditableCvDocument from "@/components/EditableCvDocument";
import type { CvEditorData } from "@/lib/cvEditor";

const fixture: CvEditorData = {
  profile: { name: "Sample Candidate", address: "Accra, Ghana", phone: "+233 20 000 0000", email: "sample@example.com", linkedin: "https://linkedin.com/in/sample" },
  summary: "Operations professional with measurable delivery experience.",
  skills: ["Claims assessment", "Reconciliation", "Reporting"],
  highlights: ["Reduced processing delays by 20%"],
  experience: [{ id: "role-1", company: "Example Ltd", title: "Claims Officer", location: "Accra", period: "Jan 2022 – Present", contributions: ["Reviewed and processed claims"] }],
  education: [{ id: "edu-1", school: "Example University", qualification: "BSc", field: "Accounting", period: "2018", location: "Ghana", description: "Graduated with honours" }],
  leadership: ["Volunteer coordinator"],
  professionalDevelopment: ["Claims management workshop"],
  professionalStrengths: ["Attention to detail"],
  languages: ["English — Fluent"],
  references: "Available on request",
};

describe("EditableCvDocument ATS layout", () => {
  it("renders the edited content in a single-column document with predictable section order", () => {
    const html = renderToStaticMarkup(<EditableCvDocument data={fixture} kind="cv" />);
    expect(html).toContain("Claims assessment");
    expect(html).toContain("Claims Officer");
    expect(html).toContain("CURRICULUM VITAE");
    expect(html).toContain("Accra | Jan 2022 – Present");
    expect(html).not.toContain("cv-skill-grid");
    expect(html).not.toContain("cv-entry-header");
    const headings = ["SUMMARY", "SKILLS", "EXPERIENCE", "EDUCATION", "SELECTED ACHIEVEMENTS", "LEADERSHIP &amp; VOLUNTEERING", "PROFESSIONAL STRENGTHS", "PROFESSIONAL DEVELOPMENT", "LANGUAGES", "REFERENCES"];
    let previous = -1;
    for (const heading of headings) {
      const current = html.indexOf(heading);
      expect(current).toBeGreaterThan(previous);
      previous = current;
    }
  });

  it("omits empty sections rather than rendering empty headings", () => {
    const html = renderToStaticMarkup(<EditableCvDocument data={{ ...fixture, skills: [], experience: [], education: [], highlights: [], leadership: [], professionalDevelopment: [], professionalStrengths: [], languages: [] }} kind="cv" />);
    expect(html).not.toContain("<h2>SKILLS</h2>");
    expect(html).not.toContain("<h2>EXPERIENCE</h2>");
    expect(html).toContain("SUMMARY");
  });

  it("renders a concise resume without secondary CV sections or unsupported content", () => {
    const html = renderToStaticMarkup(<EditableCvDocument data={fixture} kind="resume" />);
    expect(html).toContain("RESUME");
    expect(html).toContain("Claims Officer");
    expect(html).toContain("KEY ACHIEVEMENTS");
    expect(html).not.toContain("LEADERSHIP &amp; VOLUNTEERING");
    expect(html).not.toContain("PROFESSIONAL DEVELOPMENT");
    expect(html).not.toContain("Graduated with honours");
  });
});
