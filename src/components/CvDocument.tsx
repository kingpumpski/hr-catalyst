import { companies, education, leadership, profile } from "@/data/profile";
import type { CvVersion } from "@/data/cvVersions";
import { useMemo } from "react";
import { loadDocumentSettings } from "@/lib/documentSettings";

/**
 * Canonical ATS-first CV renderer.
 *
 * This component intentionally uses a single semantic document flow:
 * no tables, no multi-column layout, no icons, no photos, no decorative
 * graphics, and no recruiter-facing UI inside the printable document.
 * The same markup is used for the browser preview and browser PDF export.
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

  const handlePrint = () => {
    const previousTitle = document.title;
    document.title = `${profile.name} - ${version.title} - CV`;
    window.print();
    window.setTimeout(() => {
      document.title = previousTitle;
    }, 1000);
  };

  return (
    <article className="cv-doc" aria-label={`${profile.name} CV - ${version.title}`}>
      <header className="cv-header">
        <h1>{profile.name}</h1>
        <p className="cv-target-role">{version.title}</p>
        <p className="cv-headline">{profile.headline}</p>
        <div className="cv-contact" aria-label="Contact information">
          {settings.showLocation && <span>{profile.address}</span>}
          {contactItems.map((item) => (
            <span key={item.label}>
              <strong>{item.label}:</strong> {item.value}
            </span>
          ))}
        </div>
      </header>

      <section>
        <h2>PROFESSIONAL SUMMARY</h2>
        <p>{version.summary}</p>
      </section>

      <section>
        <h2>CORE COMPETENCIES</h2>
        <ul className="cv-compact-list">
          {version.coreSkills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>PROFESSIONAL EXPERIENCE</h2>
        <div>
          {companies.map((company) =>
            company.roles.map((role) => (
              <article key={company.company + role.title + role.period} className="cv-entry">
                <h3>{role.title}</h3>
                <p className="cv-company">{company.company}</p>
                <p className="cv-meta">
                  {role.period} | {role.employmentType} | {role.location}
                </p>
                <p>{role.summary}</p>
                <ul>
                  {role.contributions.map((contribution) => (
                    <li key={contribution}>{contribution}</li>
                  ))}
                </ul>
              </article>
            ))
          )}
        </div>
      </section>

      <section>
        <h2>KEY ACHIEVEMENTS</h2>
        <ul>
          {version.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      </section>

      {leadership.length > 0 && (
        <section>
          <h2>LEADERSHIP &amp; COMMUNITY INVOLVEMENT</h2>
          {leadership.map((entry) => (
            <article key={`${entry.company}-${entry.title}`} className="cv-entry">
              <h3>{entry.title}</h3>
              <p className="cv-company">{entry.company}</p>
              <p className="cv-meta">
                {entry.period} | {entry.employmentType} | {entry.location}
              </p>
              <ul>
                {entry.contributions.slice(0, 3).map((contribution) => (
                  <li key={contribution}>{contribution}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      )}

      <section>
        <h2>EDUCATION</h2>
        {education.map((entry) => (
          <article key={entry.school} className="cv-entry">
            <h3>{entry.qualification}</h3>
            <p className="cv-company">{entry.school}</p>
            <p className="cv-meta">{entry.period} | {entry.location}</p>
          </article>
        ))}
      </section>

      <section>
        <h2>ADDITIONAL INFORMATION</h2>
        <p>
          <strong>Languages:</strong> {profile.languages.join(", ")}
          {settings.showAvailability ? ` | Availability: ${profile.availability}` : ""}
          {settings.showReferences ? ` | References: ${profile.references}` : ""}
        </p>
      </section>

      <div className="no-print cv-actions">
        <button type="button" onClick={handlePrint}>
          Download / Save as PDF
        </button>
      </div>
    </article>
  );
};

export default CvDocument;
