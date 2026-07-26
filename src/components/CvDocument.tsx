import { companies, education, profile } from "@/data/profile";
import type { CvVersion } from "@/data/cvVersions";

/** ATS-friendly single-column document: plain semantic text, no columns, no graphics. */
const CvDocument = ({ version }: { version: CvVersion }) => {
  return (
    <article className="cv-doc bg-card text-card-foreground rounded-lg border border-border p-8 md:p-12 leading-relaxed">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{profile.name}</h1>
        <p className="text-lg text-foreground/90">{version.title}</p>
        <p className="text-sm text-muted-foreground mt-2">
          {profile.location} · {profile.phone} · {profile.email}
        </p>
      </header>

      <section className="mb-6">
        <h2 className="text-base font-bold uppercase tracking-wide text-foreground border-b border-border pb-1 mb-3">
          Professional Summary
        </h2>
        <p className="text-sm text-foreground/90">{version.summary}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-bold uppercase tracking-wide text-foreground border-b border-border pb-1 mb-3">
          Core Competencies
        </h2>
        <p className="text-sm text-foreground/90">{version.coreSkills.join(" • ")}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-bold uppercase tracking-wide text-foreground border-b border-border pb-1 mb-3">
          Key Achievements
        </h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/90">
          {version.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-bold uppercase tracking-wide text-foreground border-b border-border pb-1 mb-3">
          Professional Experience
        </h2>
        <div className="space-y-5">
          {companies.map((company) =>
            company.roles.map((role) => (
              <div key={company.company + role.title + role.period}>
                <h3 className="text-sm font-bold text-foreground">
                  {role.title} — {company.company}
                </h3>
                <p className="text-xs text-muted-foreground mb-1">
                  {role.period} · {role.employmentType} · {role.location}
                </p>
                <p className="text-sm text-foreground/90 mb-1">{role.summary}</p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/90">
                  {role.contributions.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-bold uppercase tracking-wide text-foreground border-b border-border pb-1 mb-3">
          Education
        </h2>
        <div className="space-y-4">
          {education.map((e) => (
            <div key={e.school}>
              <h3 className="text-sm font-bold text-foreground">{e.school}</h3>
              <p className="text-sm text-foreground/90">{e.qualification}</p>
              <p className="text-xs text-muted-foreground">
                {e.period} · {e.location}
              </p>
              {e.coursework && (
                <p className="text-sm text-foreground/90 mt-1">
                  <span className="font-semibold">Relevant coursework: </span>
                  {e.coursework.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-base font-bold uppercase tracking-wide text-foreground border-b border-border pb-1 mb-3">
          Additional Information
        </h2>
        <p className="text-sm text-foreground/90">
          Languages: English (fluent). Availability: immediate. References available on request.
        </p>
      </section>
    </article>
  );
};

export default CvDocument;