import "@/cv-print.css";
import type { CvEditorData } from "@/lib/cvEditor";
import { getCvFormatProfile } from "@/data/cvFormatProfiles";
import { loadDocumentSettings } from "@/lib/documentSettings";

const EditableCvDocument = ({ data }: { data: CvEditorData }) => {
  const settings = loadDocumentSettings();
  const format = getCvFormatProfile(settings.targetMarket);
  const contact = [
    settings.showLocation ? data.profile.address : "",
    settings.showContactDetails ? data.profile.phone : "",
    settings.showContactDetails ? data.profile.email : "",
    settings.includeLinkedIn && settings.showContactDetails
      ? data.profile.linkedin.replace(/^https?:\/\//, "")
      : "",
  ].map((item) => item.trim()).filter(Boolean);
  const listSection = (title: string, items: string[]) => {
    const visible = items.map((item) => item.trim()).filter(Boolean);
    if (!visible.length) return null;
    return <section><h2>{title}</h2><ul className="cv-bullet-list">{visible.map((item, index) => <li key={index}>{item}</li>)}</ul></section>;
  };

  return (
    <article
      className={`cv-doc cv-paper-${format.paperSize.toLowerCase()} cv-market-${format.market}`}
      aria-label={`${data.profile.name} CV preview`}
    >
      <header className="cv-header">
        <h1>{data.profile.name}</h1>
        <div className="cv-contact" aria-label="Contact information">
          {contact.map((item, index) => <span key={index}>{item}</span>)}
        </div>
      </header>
      {data.summary.trim() && <section><h2>SUMMARY</h2><p>{data.summary.trim()}</p></section>}
      {listSection("SKILLS", data.skills)}
      {data.experience.length > 0 && <section><h2>EXPERIENCE</h2>
        {data.experience.map((item) => {
          const meta = [item.location.trim(), item.period.trim()].filter(Boolean).join(" | ");
          return <article className="cv-entry" key={item.id}>
            <div className="cv-entry-primary">
              <h3>{item.title}</h3>
              <p className="cv-company">{item.company}</p>
            </div>
            {meta && <p className="cv-entry-meta">{meta}</p>}
            {item.contributions.some((line) => line.trim()) && <ul className="cv-bullet-list">{item.contributions.filter((line) => line.trim()).map((line, index) => <li key={index}>{line}</li>)}</ul>}
          </article>;
        })}
      </section>}
      {data.education.length > 0 && <section><h2>EDUCATION</h2>
        {data.education.map((item) => {
          const meta = [item.location.trim(), item.period.trim()].filter(Boolean).join(" | ");
          return <article className="cv-entry" key={item.id}>
            <div className="cv-entry-primary">
              <h3>{item.school}</h3>
              <p className="cv-company">{[item.qualification, item.field].filter(Boolean).join(" — ")}</p>
            </div>
            {meta && <p className="cv-entry-meta">{meta}</p>}
            {item.description.trim() && <ul className="cv-bullet-list"><li>{item.description.trim()}</li></ul>}
          </article>;
        })}
      </section>}
      {listSection("SELECTED ACHIEVEMENTS", data.highlights)}
      {listSection("LEADERSHIP & VOLUNTEERING", data.leadership)}
      {listSection("PROFESSIONAL STRENGTHS", data.professionalStrengths)}
      {listSection("PROFESSIONAL DEVELOPMENT", data.professionalDevelopment)}
      {listSection("LANGUAGES", data.languages)}
      {settings.showReferences && data.references.trim() && <section><h2>REFERENCES</h2><p>{data.references.trim()}</p></section>}
    </article>
  );
};

export default EditableCvDocument;
