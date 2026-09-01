import { companies, education, leadership, profile } from "@/data/profile";
import type { CvVersion } from "@/data/cvVersions";
import { useMemo } from "react";
import { loadDocumentSettings } from "@/lib/documentSettings";

/**
 * Shared ATS-first CV renderer.
 * Every CV version uses this same structure so preview and PDF output remain consistent.
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
    <article className="cv-doc mx-auto bg-white text-black leading-relaxed shadow-sm">
      <header className="cv-header border-b-2 border-black pb-4 mb-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">{profile.name}</h1>
          <p className="text-base font-semibold">{version.title}</p>
          <p className="text-sm font-medium">{profile.headline}</p>
        </div>
        <div className="cv-contact mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {settings.showLocation && <span>{profile.address}</span>}
          {contactItems.map((item) => (
            <span key={item.label}>
              <span className="font-semibold">{item.label}:</span> {item.value}
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
        <ul className="cv-compact-list grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          {version.coreSkills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>KEY ACHIEVEMENTS</h2>
        <ul>
          {version.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>PROFESSIONAL EXPERIENCE</h2>
        <div className="space-y-4">
          {companies.map((company) =>
            company.roles.map((role) => (
              <div key={company.company + role.title + role.period} className="cv-entry">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-x-4">
                  <h3>{role.title} — {company.company}</h3>
                  <p className="cv-meta shrink-0">{role.period}</p>
                </div>
                <p className="cv-meta">{role.employmentType} · {role.location}</p>
                <p className="mt-1">{role.summary}</p>
                <ul className="mt-1">
                  {role.contributions.map((contribution) => (
                    <li key={contribution}>{contribution}</li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </section>

      {leadership.length > 0 && (
        <section>
          <h2>LEADERSHIP &amp; COMMUNITY INVOLVEMENT</h2>
          <div className="space-y-3">
            {leadership.map((entry) => (
              <div key={`${entry.company}-${entry.title}`} className="cv-entry">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-x-4">
                  <h3>{entry.title} — {entry.company}</h3>
                  <p className="cv-meta shrink-0">{entry.period}</p>
                </div>
                <p className="cv-meta">{entry.employmentType} · {entry.location}</p>
                <ul className="mt-1">
                  {entry.contributions.slice(0, 3).map((contribution) => (
                    <li key={contribution}>{contribution}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2>EDUCATION</h2>
        <div className="space-y-3">
          {education.map((entry) => (
            <div key={entry.school} className="cv-entry">
              <h3>{entry.school}</h3>
              <p className="font-medium">{entry.qualification}</p>
              <p className="cv-meta">{entry.period} · {entry.location}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>ADDITIONAL INFORMATION</h2>
        <p>
          <span className="font-semibold">Languages:</span> {profile.languages.join(", ")}
          {settings.showAvailability ? ` · Availability: ${profile.availability}` : ""}
          {settings.showReferences ? ` · References: ${profile.references}` : ""}
        </p>
      </section>

      <div className="no-print mt-8 border-t pt-4 text-right">
        <button
          type="button"
          onClick={handlePrint}
          className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Download / Save as PDF
        </button>
      </div>
    </article>
  );
};

export default CvDocument;
