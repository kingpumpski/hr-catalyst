import "@/cv-print.css";
import type { CvEditorData } from "@/lib/cvEditor";
import { getCvFormatProfile } from "@/data/cvFormatProfiles";
import { loadDocumentSettings } from "@/lib/documentSettings";

const EditableCvDocument = ({ data }: { data: CvEditorData }) => {
  const settings = loadDocumentSettings();
  const format = getCvFormatProfile(settings.targetMarket);

  return (
    <article
      className={`cv-doc cv-paper-${format.paperSize.toLowerCase()} cv-market-${format.market}`}
      aria-label={`${data.profile.name} CV preview`}
    >
      <header className="cv-header">
        <h1>{data.profile.name}</h1>
        <div className="cv-contact">
          {[
            settings.showLocation ? data.profile.address : "",
            settings.showContactDetails ? data.profile.phone : "",
            settings.showContactDetails ? data.profile.email : "",
            settings.includeLinkedIn && settings.showContactDetails ? data.profile.linkedin : "",
          ].filter(Boolean).map((item, index) => <span key={index}>{item}</span>)}
        </div>
      </header>
      {data.summary.trim() && <section><h2>SUMMARY</h2><p>{data.summary}</p></section>}
      {data.skills.length > 0 && <section><h2>SKILLS</h2><div className="cv-skill-grid"><ul className="cv-bullet-list">{data.skills.slice(0, Math.ceil(data.skills.length / 2)).map(item => <li key={item}>{item}</li>)}</ul><ul className="cv-bullet-list">{data.skills.slice(Math.ceil(data.skills.length / 2)).map(item => <li key={item}>{item}</li>)}</ul></div></section>}
      {data.experience.length > 0 && <section><h2>EXPERIENCE</h2>{data.experience.map(item => <article className="cv-entry" key={item.id}><div className="cv-entry-header"><div className="cv-entry-primary"><h3>{item.title}</h3><p className="cv-company">{item.company}</p></div><div className="cv-entry-meta"><span>{item.location}</span><span>{item.period}</span></div></div><ul className="cv-bullet-list">{item.contributions.map((line, index) => <li key={index}>{line}</li>)}</ul></article>)}</section>}
      {data.education.length > 0 && <section><h2>EDUCATION</h2>{data.education.map(item => <article className="cv-entry" key={item.id}><div className="cv-entry-header"><div className="cv-entry-primary"><h3>{item.school}</h3><p className="cv-company">{[item.qualification, item.field].filter(Boolean).join(" — ")}</p></div><div className="cv-entry-meta"><span>{item.location}</span><span>{item.period}</span></div></div>{item.description && <p>{item.description}</p>}</article>)}</section>}
      {data.highlights.length > 0 && <section><h2>SELECTED ACHIEVEMENTS</h2><ul className="cv-bullet-list">{data.highlights.map((item, index) => <li key={index}>{item}</li>)}</ul></section>}
      {data.leadership.length > 0 && <section><h2>LEADERSHIP & VOLUNTEERING</h2><ul className="cv-bullet-list">{data.leadership.map((item, index) => <li key={index}>{item}</li>)}</ul></section>}
      {data.professionalStrengths.length > 0 && <section><h2>PROFESSIONAL STRENGTHS</h2><ul className="cv-bullet-list">{data.professionalStrengths.map((item, index) => <li key={index}>{item}</li>)}</ul></section>}
      {data.professionalDevelopment.length > 0 && <section><h2>PROFESSIONAL DEVELOPMENT</h2><ul className="cv-bullet-list">{data.professionalDevelopment.map((item, index) => <li key={index}>{item}</li>)}</ul></section>}
      {data.languages.length > 0 && <section><h2>LANGUAGES</h2><ul className="cv-bullet-list">{data.languages.map((item, index) => <li key={index}>{item}</li>)}</ul></section>}
      {settings.showReferences && data.references.trim() && <section><h2>REFERENCES</h2><p>{data.references}</p></section>}
    </article>
  );
};

export default EditableCvDocument;
