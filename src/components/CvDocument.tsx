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
  const recruiterSummary = getRecruiterSafeSummary(version);

  return (
    <article
      className={`cv-doc cv-paper-${format.paperSize.toLowerCase()} cv-market-${format.market}`}
      aria-label={`${profile.name} ${documentLabel}`}
    >
      <header className="cv-header">
        <div className={showPhoto ? "cv-header-with-photo" : undefined}>
          <div className="cv-identity">
            <h1>{profile.name}</h1>
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

      <section>
        <h2>SUMMARY</h2>
        <p>{recruiterSummary}</p>
      </section>

      <section>
        <h2>CORE COMPETENCIES</h2>
        <ul className="cv-bullet-list">
          {technicalSkills.map((skill) => <li key={skill}>{skill}</li>)}
        </ul>
      </section>

      <section>
        <h2>EXPERIENCE</h2>
        {companies.map((company) => company.roles.map((role) => (
          <article key={company.company + role.title + role.period} className="cv-entry">
            <div className="cv-entry-header">
              <div className="cv-entry-primary">
                <h3>{role.title}</h3>
                <p className="cv-company">{company.company}</p>
              </div>
              <div className="cv-entry-meta">
                <span>{role.location}</span>
                <span>{role.period}</span>
              </div>
            </div>
            <ul className="cv-bullet-list">
              {role.contributions.map((contribution) => <li key={contribution}>{contribution}</li>)}
            </ul>
          </article>
        )))}
      </section>

      <section>
        <h2>EDUCATION</h2>
        {education.map((entry) => (
          <article key={entry.school} className="cv-entry">
            <div className="cv-entry-header">
              <div className="cv-entry-primary">
                <h3>{entry.school}</h3>
                <p className="cv-company">
                  {entry.qualification}{entry.field ? ` — ${entry.field}` : ""}
                </p>
              </div>
              <div className="cv-entry-meta">
                <span>{entry.location}</span>
                <span>{entry.period}</span>
              </div>
            </div>
            {(entry.description || entry.coursework?.length || entry.activities?.length) && (
              <ul className="cv-bullet-list cv-education-details">
                {entry.description && <li>{entry.description}</li>}
                {entry.coursework?.length ? (
                  <li>
                    <span className="cv-detail-label">Relevant coursework</span>
                    <ul>
                      {entry.coursework.map((course) => <li key={course}>{course}</li>)}
                    </ul>
                  </li>
                ) : null}
                {entry.activities?.map((activity) => <li key={activity}>{activity}</li>)}
              </ul>
            )}
          </article>
        ))}
      </section>

      <section>
        <h2>TECHNICAL SKILLS</h2>
        <ul className="cv-bullet-list">
          {technicalSkills.map((skill) => <li key={skill}>{skill}</li>)}
        </ul>
      </section>

      <section>
        <h2>SELECTED ACHIEVEMENTS</h2>
        <ul className="cv-bullet-list">
          {version.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
        </ul>
      </section>

      {leadership.length > 0 && (
        <section>
          <h2>LEADERSHIP &amp; FINANCIAL ACCOUNTABILITY</h2>
          {leadership.map((entry) => (
            <article key={`${entry.company}-${entry.title}`} className="cv-entry">
              <div className="cv-entry-header">
                <div className="cv-entry-primary">
                  <h3>{entry.title}</h3>
                  <p className="cv-company">{entry.company}</p>
                </div>
                <div className="cv-entry-meta">
                  <span>{entry.location}</span>
                  <span>{entry.period}</span>
                </div>
              </div>
              <ul className="cv-bullet-list">
                {entry.contributions.slice(0, 5).map((contribution) => <li key={contribution}>{contribution}</li>)}
              </ul>
            </article>
          ))}
        </section>
      )}

      <section>
        <h2>PROFESSIONAL STRENGTHS</h2>
        <ul className="cv-bullet-list">
          {strengths.map((strength) => <li key={strength}>{strength}</li>)}
        </ul>
      </section>

      <section>
        <h2>LANGUAGES</h2>
        <ul className="cv-bullet-list">
          {profile.languages.map((language) => (
            <li key={language.name}>{language.name} — {language.proficiency}</li>
          ))}
        </ul>
      </section>

      {settings.showReferences && (
        <section>
          <h2>REFERENCES</h2>
          <ul className="cv-bullet-list">
            <li>{profile.references}</li>
          </ul>
        </section>
      )}
    </article>
  );
};

export default CvDocument;
