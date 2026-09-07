import { profile } from "@/data/profile";
import type { CvVersion } from "@/data/cvVersions";
import { buildCoverLetter, type CoverLetterInputs } from "@/lib/coverLetter";
import { loadDocumentSettings } from "@/lib/documentSettings";
import { getCvFormatProfile } from "@/data/cvFormatProfiles";
import { useMemo } from "react";
import "@/cv-print.css";

type CoverLetterDocumentProps = CoverLetterInputs & { version: CvVersion };

const CoverLetterDocument = ({ version, ...inputs }: CoverLetterDocumentProps) => {
  const settings = useMemo(() => loadDocumentSettings(), []);
  const format = getCvFormatProfile(settings.targetMarket);
  const letter = buildCoverLetter(version, inputs);
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const contactLine = [
    settings.showLocation ? profile.address : "",
    settings.showContactDetails ? profile.phone : "",
    settings.showContactDetails ? profile.email : "",
    settings.includeLinkedIn && settings.showContactDetails ? profile.linkedin.replace(/^https?:\/\//, "") : "",
  ].filter(Boolean);

  return (
    <article
      className={`cv-doc cv-letter cv-paper-${format.paperSize.toLowerCase()} cv-market-${format.market}`}
      aria-label={`${profile.name} cover letter`}
    >
      <header className="cv-header">
        <h1>{profile.name}</h1>
        <div className="cv-contact" aria-label="Contact information">
          {contactLine.map((item) => <span key={item}>{item}</span>)}
        </div>
      </header>

      <p className="cv-letter-date">{today}</p>

      <div className="cv-letter-recipient">
        <p>{letter.recipientName}</p>
        <p>{letter.employerName}</p>
        <p>{letter.companyAddress}</p>
      </div>

      <p className="cv-letter-subject">{letter.subject}</p>

      <p className="cv-letter-paragraph">{letter.greeting}</p>

      {letter.paragraphs.map((paragraph) => (
        <p key={paragraph} className="cv-letter-paragraph">{paragraph}</p>
      ))}

      <p className="cv-letter-paragraph">Yours sincerely,</p>
      <p className="cv-letter-signature">{letter.signOff}</p>
    </article>
  );
};

export default CoverLetterDocument;
