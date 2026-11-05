import "@/cv-print.css";
import { getCvFormatProfile } from "@/data/cvFormatProfiles";
import type { CvVersion } from "@/data/cvVersions";
import { loadDocumentSettings } from "@/lib/documentSettings";
import { createOriginalCvContent, type CvDocumentContent } from "@/data/cvDocumentContent";

type CareerDocumentType = "cv" | "resume";

type CvDocumentProps = {
  version: CvVersion;
  documentType?: CareerDocumentType;
  content?: CvDocumentContent;
};

const documentLabels: Record<CareerDocumentType, string> = {
  cv: "CV",
  resume: "Resume",
};

const splitIntoBalancedColumns = <T,>(items: T[]): [T[], T[]] => {
  const midpoint = Math.ceil(items.length / 2);
  return [items.slice(0, midpoint), items.slice(midpoint)];
};

const CvDocument = ({ version, documentType = "cv", content = createOriginalCvContent(version) }: CvDocumentProps) => {
  const settings = loadDocumentSettings();
  const format = getCvFormatProfile(settings.targetMarket);
  const documentLabel = documentLabels[documentType];
  const showPhoto = settings.includePhoto && Boolean(settings.photoUrl) && format.photoPolicy !== "never";
  const contactItems = [
    { label: "Phone", value: content.phone },
    { label: "Email", value: content.email },
    { label: "LinkedIn", value: content.linkedin.replace(/^https?:\/\//, "") },
  ].filter((item) => {
    if (item.label === "Phone" || item.label === "Email") return settings.showContactDetails;
    return settings.includeLinkedIn && settings.showContactDetails;
  });

  const skills = Array.from(new Set(content.coreSkills));
  const skillColumns = splitIntoBalancedColumns(skills);
  const strengthColumns = splitIntoBalancedColumns(content.strengths);

  return (
    <article
      className={`cv-doc cv-paper-${format.paperSize.toLowerCase()} cv-market-${format.market}`}
      aria-label={`${content.name} ${documentLabel}`}
    >
      <header className="cv-header">
        <div className={showPhoto ? "cv-header-with-photo" : undefined}>
          <div className="cv-identity">
            <h1>{content.name}</h1>
            <div className="cv-contact" aria-label="Contact information">
              {settings.showLocation && <span>{content.address}</span>}
              {contactItems.map((item) => <span key={item.label}>{item.value}</span>)}
            </div>
          </div>
          {showPhoto && (
            <img
              className="cv-profile-photo"
              src={settings.photoUrl}
              alt={content.name}
              loading="lazy"
            />
          )}
        </div>
      </header>

      <section>
        <h2>SUMMARY</h2>
        <p>{content.summary}</p>
      </section>

      <section>
        <h2>SKILLS</h2>
        <div className="cv-skill-grid" aria-label="Skills">
          {skillColumns.map((column, columnIndex) => (
            <ul key={`skills-${columnIndex}`} className="cv-bullet-list">
              {column.map((skill) => <li key={skill}>{skill}</li>)}
            </ul>
          ))}
        </div>
      </section>

      <section>
        <h2>EXPERIENCE</h2>
        {content.companies.map((company) => company.roles.map((role) => (
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
            {role.summary && <p>{role.summary}</p>}
            <ul className="cv-bullet-list">
              {role.contributions.map((contribution) => <li key={contribution}>{contribution}</li>)}
            </ul>
            {role.skills.length > 0 && <p className="cv-role-skills"><strong>Skills:</strong> {role.skills.join(", ")}</p>}
          </article>
        )))}
      </section>

      <section>
        <h2>EDUCATION</h2>
        {content.education.map((entry) => (
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
        <h2>SELECTED ACHIEVEMENTS</h2>
        <ul className="cv-bullet-list">
          {content.highlights.map((highlight, index) => <li key={`${highlight}-${index}`}>{highlight}</li>)}
        </ul>
      </section>

      {content.leadership.length > 0 && (
        <section>
          <h2>LEADERSHIP &amp; FINANCIAL ACCOUNTABILITY</h2>
          {content.leadership.map((entry, index) => (
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
              {entry.summary && <p>{entry.summary}</p>}
              <ul className="cv-bullet-list">
                {entry.contributions.slice(0, 5).map((contribution, contributionIndex) => <li key={`${index}-${contributionIndex}`}>{contribution}</li>)}
              </ul>
            </article>
          ))}
        </section>
      )}

      <section>
        <h2>PROFESSIONAL STRENGTHS</h2>
        <div className="cv-skill-grid" aria-label="Professional strengths">
          {strengthColumns.map((column, columnIndex) => (
            <ul key={`strengths-${columnIndex}`} className="cv-bullet-list">
              {column.map((strength) => <li key={strength}>{strength}</li>)}
            </ul>
          ))}
        </div>
      </section>

      {content.workshops.length > 0 && (
        <section>
          <h2>PROFESSIONAL DEVELOPMENT</h2>
          <ul className="cv-bullet-list">
            {content.workshops.map((item, index) => (
              <li key={`${item.title}-${index}`}>
                {item.title} — {item.organization}, {item.period}
                {item.location && ` | ${item.location}`}
                {item.summary && <p>{item.summary}</p>}
                {item.highlights.map((highlight, highlightIndex) => <p key={`${index}-${highlightIndex}`}>{highlight}</p>)}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2>LANGUAGES</h2>
        <ul className="cv-bullet-list cv-language-list">
          {content.languages.map((language) => (
            <li key={language.name}>
              <span className="cv-language-row">
                <span>{language.name}</span>
                <span>{language.proficiency}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {settings.showReferences && (
        <section>
          <h2>REFERENCES</h2>
          <p>{content.references}</p>
        </section>
      )}
    </article>
  );
};

export default CvDocument;
