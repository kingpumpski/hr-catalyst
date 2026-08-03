import { companies, education, profile } from "@/data/profile";
import type { CvVersion } from "@/data/cvVersions";
import { useMemo } from "react";
import { loadDocumentSettings } from "@/lib/documentSettings";

const ResumeDocument = ({ version }: { version: CvVersion }) => {
  const settings = useMemo(() => loadDocumentSettings(), []);
  const contactItems = [
    { label: "Email", value: profile.email },
    { label: "Phone", value: profile.phone },
    { label: "WhatsApp", value: profile.whatsapp },
    { label: "LinkedIn", value: profile.linkedin },
  ].filter((item) => {
    if (item.label === "Email" || item.label === "Phone") return settings.showContactDetails;
    if (item.label === "WhatsApp") return settings.includeWhatsApp && settings.showContactDetails;
    if (item.label === "LinkedIn") return settings.includeLinkedIn && settings.showContactDetails;
    return Boolean(item.value);
  });

  const relevantRoles = companies
    .flatMap((company) =>
      company.roles.map((role) => ({ ...role, company: company.company, location: company.location }))
    )
    .slice(0, 4);

  return (
    <article className="cv-doc bg-card text-card-foreground rounded-lg border border-border p-8 md:p-12 leading-relaxed">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{profile.name}</h1>
        <p className="text-lg text-foreground/90">{version.title}</p>
        <p className="text-sm text-muted-foreground mt-2">{profile.headline}</p>
        <div className="mt-3 space-y-1 text-sm text-foreground/90">
          {settings.showLocation && <p>{profile.address}</p>}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {contactItems.map((item) => (
              <span key={item.label}>
                <span className="font-semibold">{item.label}:</span> {item.value}
              </span>
            ))}
          </div>
        </div>
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
          Relevant Experience
        </h2>
        <div className="space-y-4">
          {relevantRoles.map((role) => (
            <div key={`${role.company}-${role.title}`}>
              <h3 className="text-sm font-bold text-foreground">
                {role.title} — {role.company}
              </h3>
              <p className="text-xs text-muted-foreground mb-1">
                {role.period} · {role.location}
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/90">
                {role.contributions.slice(0, 3).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-bold uppercase tracking-wide text-foreground border-b border-border pb-1 mb-3">
          Education
        </h2>
        <div className="space-y-3">
          {education.map((item) => (
            <div key={item.school}>
              <h3 className="text-sm font-bold text-foreground">{item.school}</h3>
              <p className="text-sm text-foreground/90">{item.qualification}</p>
              <p className="text-xs text-muted-foreground">{item.period} · {item.location}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-base font-bold uppercase tracking-wide text-foreground border-b border-border pb-1 mb-3">
          Additional Information
        </h2>
        <p className="text-sm text-foreground/90">
          Languages: {profile.languages.join(", ")}.{settings.showAvailability ? ` Availability: ${profile.availability}.` : ""}{settings.showReferences ? ` References: ${profile.references}.` : ""}
        </p>
      </section>
    </article>
  );
};

export default ResumeDocument;
