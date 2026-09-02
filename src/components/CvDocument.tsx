import "@/cv-print.css";
import { companies, education, leadership, profile } from "@/data/profile";
import type { CvVersion } from "@/data/cvVersions";
import { useMemo } from "react";
import { loadDocumentSettings } from "@/lib/documentSettings";

const atsDocumentProfile = {
  name: "Kingsley Junior Norku",
  address: "Tema, Greater Accra, Ghana",
  phone: "0542069136",
  email: "kingpumpski@gmail.com",
  linkedin: "linkedin.com/in/kingsley-junior-norku-a74407124",
  languages: ["English", "Fante", "Twi"],
  references: "References available upon request",
};

/**
 * Canonical ATS-first CV/resume renderer.
 *
 * Every downloadable CV and resume uses the approved ATS reference structure:
 * centered identity/contact block, professional summary, ruled uppercase
 * sections, conventional experience entries, two-column bulleted technical
 * skills, achievements, leadership, professional strengths, languages and
 * references.
 */
const CvDocument = ({ version }: { version: CvVersion }) => {
  const settings = useMemo(() => loadDocumentSettings(), []);
  const contactItems = [
    { label: "Phone", value: atsDocumentProfile.phone },
    { label: "Email", value: atsDocumentProfile.email },
    { label: "LinkedIn", value: atsDocumentProfile.linkedin },
  ].filter((item) => {
    if (item.label === "Phone" || item.label === "Email") return settings.showContactDetails;
    return settings.includeLinkedIn && settings.showContactDetails;
  });

  const strengths = [
    "Accuracy",
    "Integrity",
    "Financial Discipline",
    "Attention to Detail",
    "Confidentiality",
    "Analytical Thinking",
    "Problem Solving",
    "Operational Coordination",
    "Documentation",
    "Team Collaboration",
    "Time Management",
    "Continuous Improvement",
  ];

  const technicalSkills = Array.from(new Set(version.coreSkills));
  const splitIndex = Math.ceil(technicalSkills.length / 2);
  const technicalSkillColumns = [
    technicalSkills.slice(0, splitIndex),
    technicalSkills.slice(splitIndex),
  ].filter((column) => column.length > 0);

  return (
    <article className="cv-doc" aria-label={`${atsDocumentProfile.name} CV - ${version.title}`}>
      <header className="cv-header">
        <h1>{atsDocumentProfile.name}</h1>
        <div className="cv-contact" aria-label="Contact information">
          {settings.showLocation && <span>{atsDocumentProfile.address}</span>}
          {contactItems.map((item) => (
            <span key={item.label}>{item.value}</span>
          ))}
        </div>
      </header>

      <section>
        <h2>SUMMARY</h2>
        <p>{version.summary}</p>
      </section>

      <section>
        <h2>EDUCATION</h2>
        {education.map((entry) => (
          <article key={entry.school} className="cv-entry">
            <div className="cv-entry-line">
              <h3>{entry.school}</h3>
              <span className="cv-meta">{entry.location}</span>
            </div>
            <div className="cv-entry-line cv-entry-subline">
              <p className="cv-italic">
                {entry.qualification}{entry.field ? ` — ${entry.field}` : ""}
              </p>
              <span className="cv-meta">{entry.period}</span>
            </div>
            {entry.coursework && entry.coursework.length > 0 && (
              <p className="cv-coursework">Relevant areas include {entry.coursework.join(", ")}.</p>
            )}
          </article>
        ))}
      </section>

      <section>
        <h2>EXPERIENCE</h2>
        {companies.map((company) =>
          company.roles.map((role) => (
            <article key={company.company + role.title + role.period} className="cv-entry">
              <div className="cv-entry-line">
                <h3>{role.title}</h3>
                <span className="cv-meta">{role.period}</span>
              </div>
              <div className="cv-entry-line cv-entry-subline">
                <p className="cv-company">{company.company}</p>
                <span className="cv-meta">{role.location}</span>
              </div>
              <ul>
                {role.contributions.map((contribution) => (
                  <li key={contribution}>{contribution}</li>
                ))}
              </ul>
            </article>
          )),
        )}
      </section>

      <section>
        <h2>TECHNICAL SKILLS</h2>
        <div className="cv-skill-grid" role="list">
          {technicalSkillColumns.map((column, columnIndex) => (
            <ul key={`skills-${columnIndex}`}>
              {column.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          ))}
        </div>
      </section>

      <section>
        <h2>SELECTED ACHIEVEMENTS</h2>
        <ul>
          {version.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      </section>

      {leadership.length > 0 && (
        <section>
          <h2>LEADERSHIP &amp; FINANCIAL ACCOUNTABILITY</h2>
          {leadership.map((entry) => (
            <article key={`${entry.company}-${entry.title}`} className="cv-entry">
              <div className="cv-entry-line">
                <h3>{entry.company}</h3>
                <span className="cv-meta">{entry.period}</span>
              </div>
              <div className="cv-entry-line cv-entry-subline">
                <p className="cv-company">{entry.title}</p>
                <span className="cv-meta">{entry.location}</span>
              </div>
              <ul>
                {entry.contributions.slice(0, 5).map((contribution) => (
                  <li key={contribution}>{contribution}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      )}

      <section>
        <h2>PROFESSIONAL STRENGTHS</h2>
        <p>{strengths.join(" | ")}</p>
      </section>

      <section>
        <h2>LANGUAGES</h2>
        <p>{atsDocumentProfile.languages.join(" | ")}</p>
      </section>

      {settings.showReferences && (
        <section>
          <h2>REFERENCES</h2>
          <p>{atsDocumentProfile.references}</p>
        </section>
      )}
    </article>
  );
};

export default CvDocument;
