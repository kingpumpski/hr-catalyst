import "@/cv-print.css";
import { companies, leadership, profile } from "@/data/profile";
import { education } from "@/data/education";
import { getCvFormatProfile } from "@/data/cvFormatProfiles";
import type { CvVersion } from "@/data/cvVersions";
import { useMemo } from "react";
import { loadDocumentSettings } from "@/lib/documentSettings";
import { getRecruiterSafeSummary } from "@/lib/recruiterDocument";

type CareerDocumentType = "cv" | "resume";

type CvDocumentProps = {
  version: CvVersion;
  documentType?: CareerDocumentType;
};

const documentLabels: Record<CareerDocumentType, string> = {
  cv: "CV",
  resume: "Resume",
};

const CvDocument = ({ version, documentType = "cv" }: CvDocumentProps) => {
  const settings = useMemo(() => loadDocumentSettings(), []);
  const format = getCvFormatProfile(settings.targetMarket);
  const documentLabel = documentLabels[documentType];
  const showPhoto = settings.includePhoto && Boolean(settings.photoUrl) && format.photoPolicy !== "never";
  const contactItems = [
    { label: "Phone", value: profile.phone },
    { label: "Email", value: profile.email },
    { label: "LinkedIn", value: profile.linkedin.replace(/^https?:\/\//, "") },
  ].filter((item) => {
    if (item.label === "Phone" || item.label === "Email") return settings.showContactDetails;
    return settings.includeLinkedIn && settings.showContactDetails;
  });

  const strengths = [
    "Accuracy", "Integrity", "Financial Discipline", "Attention to Detail", "Confidentiality", "Analytical Thinking",
    "Problem Solving", "Operational Coordination", "Documentation", "Team Collaboration", "Time Management", "Continuous Improvement",
  ];
  const technicalSkills = Array.from(new Set(version.coreSkills));
  const recruiterSummary = getRecruiterSafeSummary(version);

  return (
    <article className={`cv-doc cv-paper-${format.paperSize.toLowerCase()} cv-market-${format.market}`} aria-label={`${profile.name} ${documentLabel}`}>
      <header className="cv-header">
        <div className={showPhoto ? "cv-header-with-photo" : undefined}>
          <div className="cv-identity">
            <h1>{profile.name}</h1>
            <p className="cv-professional-headline">{profile.headline}</p>
            <div className="cv-contact" aria-label="Contact information">
              {settings.showLocation && <span>{profile.address}</span>}
              {contactItems.map((item) => <span key={item.label}>{item.value}</span>)}
            </div>
          </div>
          {showPhoto && (
            <img
              className="cv-profile-photo"
              src={settings.photoUrl}
              alt={profile.name}
              loading="lazy"
            />
          )}
        </div>
      </header>

      <section><h2>SUMMARY</h2><p>{recruiterSummary}</p></section>

      <section><h2>CORE COMPETENCIES</h2><p>{technicalSkills.join(" | ")}</p></section>

      <section><h2>EXPERIENCE</h2>{companies.map((company) => company.roles.map((role) => (
        <article key={company.company + role.title + role.period} className="cv-entry">
          <div className="cv-entry-line"><h3>{role.title}</h3><span className="cv-meta">{role.period}</span></div>
          <div className="cv-entry-line cv-entry-subline"><p className="cv-company">{company.company}</p><span className="cv-meta">{role.location}</span></div>
          <ul>{role.contributions.map((contribution) => <li key={contribution}>{contribution}</li>)}</ul>
        </article>
      )))}</section>

      <section><h2>EDUCATION</h2>{education.map((entry) => (
        <article key={entry.school} className="cv-entry">
          <div className="cv-entry-line"><h3>{entry.school}</h3><span className="cv-meta">{entry.location}</span></div>
          <div className="cv-entry-line cv-entry-subline"><p className="cv-italic">{entry.qualification}{entry.field ? ` — ${entry.field}` : ""}</p><span className="cv-meta">{entry.period}</span></div>
          {entry.coursework?.length ? <p className="cv-coursework">Relevant areas include {entry.coursework.join(", ")}.</p> : null}
        </article>
      ))}</section>

      <section><h2>TECHNICAL SKILLS</h2><ul className="cv-skill-list">{technicalSkills.map((skill) => <li key={skill}>{skill}</li>)}</ul></section>

      <section><h2>SELECTED ACHIEVEMENTS</h2><ul>{version.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul></section>

      {leadership.length > 0 && <section><h2>LEADERSHIP &amp; FINANCIAL ACCOUNTABILITY</h2>{leadership.map((entry) => (
        <article key={`${entry.company}-${entry.title}`} className="cv-entry">
          <div className="cv-entry-line"><h3>{entry.company}</h3><span className="cv-meta">{entry.period}</span></div>
          <div className="cv-entry-line cv-entry-subline"><p className="cv-company">{entry.title}</p><span className="cv-meta">{entry.location}</span></div>
          <ul>{entry.contributions.slice(0, 5).map((contribution) => <li key={contribution}>{contribution}</li>)}</ul>
        </article>
      ))}</section>}

      <section><h2>ADDITIONAL INFORMATION</h2><p>{strengths.join(" | ")}</p><p>{profile.languages.join(" | ")}</p></section>
      {settings.showReferences && <section><h2>REFERENCES</h2><p>{profile.references}</p></section>}
    </article>
  );
};

export default CvDocument;
