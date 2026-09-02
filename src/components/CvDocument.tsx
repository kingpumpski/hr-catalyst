import { companies, education, leadership, profile } from "@/data/profile";
import type { CvVersion } from "@/data/cvVersions";
import { useMemo } from "react";
import { loadDocumentSettings } from "@/lib/documentSettings";

/**
 * Canonical ATS-first CV/resume renderer.
 *
 * This is intentionally a plain, single-column document matching the
 * approved reference CV: centered identity block, uppercase ruled sections,
 * conventional reverse-chronological experience, compact skills, achievements,
 * leadership, education, strengths, languages and references.
 */
const CvDocument = ({ version }: { version: CvVersion }) => {
  const settings = useMemo(() => loadDocumentSettings(), []);
  const contactItems = [
    { label: "Email", value: profile.email },
    { label: "Phone", value: profile.phone },
    { label: "LinkedIn", value: profile.linkedin },
  ].filter((item) => {
    if (item.label === "Email" || item.label === "Phone") return settings.showContactDetails;
    if (item.label === "LinkedIn") return settings.includeLinkedIn && settings.showContactDetails;
    return Boolean(item.value);
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

  return (
    <article className="cv-doc" aria-label={`${profile.name} CV - ${version.title}`}>
      <header className="cv-header">
        <h1>{profile.name}</h1>
        <div className="cv-contact" aria-label="Contact information">
          {settings.showLocation && <span>{profile.address}</span>}
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
              <p className="cv-italic">{entry.qualification}{entry.field ? ` — ${entry.field}` : ""}</p>
              <span className="cv-meta">{entry.period}</span>
            </div>
            {entry.coursework && entry.coursework.length > 0 && (
              <p className="cv-coursework">Relevant areas include {entry.coursework.join(", ") }.</p>
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
        <div className="cv-skill-grid">
          {technicalSkills.map((skill) => (
            <span key={skill}>{skill}</span>
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
        <p>{profile.languages.join(" | ")}</p>
      </section>

      {settings.showReferences && (
        <section>
          <h2>REFERENCES</h2>
          <p>{profile.references}</p>
        </section>
      )}
    </article>
  );
};

export default CvDocument;
